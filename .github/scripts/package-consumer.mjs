import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { spawnSync, spawn } from 'node:child_process'
import { createServer } from 'node:net'

const archive = resolve(process.argv[2])
const root = mkdtempSync(join(tmpdir(), 'localized-site-consumer-'))
const env = { ...process.env, NPM_CONFIG_CACHE: join(root, 'empty-cache'), CI: 'true', NUXT_TELEMETRY_DISABLED: '1' }
for (const key of ['NPM_TOKEN', 'NODE_AUTH_TOKEN', 'GH_TOKEN', 'GITHUB_TOKEN']) delete env[key]
writeFileSync(join(root, '.npmrc'), '')
env.NPM_CONFIG_USERCONFIG = join(root, '.npmrc')
writeFileSync(join(root, 'package.json'), JSON.stringify({
  private: true, type: 'module', dependencies: { '@nuxtjp/localized-site': `file:${archive}`, nuxt: '4.5.1', vue: '3.5.43' },
  devDependencies: { typescript: '5.9.3', 'vue-tsc': '3.2.8' }
}, null, 2))
function run(command, args) {
  const p = spawnSync(command, args, { cwd: root, env, encoding: 'utf8', timeout: 600_000 })
  assert.equal(p.status, 0, `${command}: ${p.stdout?.slice(-5000)} ${p.stderr?.slice(-5000)}`)
}
run('npm', ['install', '--registry=https://registry.npmjs.org', '--no-audit', '--no-fund'])
copyFileSync(join(root, 'node_modules/@nuxtjp/localized-site/examples/content/site.config.json'), join(root, 'site.config.json'))
writeFileSync(join(root, 'nuxt.config.ts'), `export default defineNuxtConfig({ modules: [['@nuxtjp/localized-site', { contentRoot: '.' }]], devtools: { enabled: false }, nitro: { prerender: { ignore: ['/'] } } })`)
writeFileSync(join(root, 'tsconfig.json'), JSON.stringify({ extends: './.nuxt/tsconfig.json' }))
writeFileSync(join(root, 'smoke.mjs'), `
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { localePath, siteRoutes, maintenanceForService } from '@nuxtjp/localized-site/core'
import { validateSiteConfig } from '@nuxtjp/localized-site/validator'
const config = validateSiteConfig(JSON.parse(readFileSync('site.config.json', 'utf8')))
assert.equal(siteRoutes(config).length, 8)
assert.equal(localePath('/docs?q=sample#main-content', 'en', config), '/en/docs?q=sample#main-content')
assert.equal(maintenanceForService({}, 'sample-service'), null)
`)
run('node', ['smoke.mjs'])
run('node', ['node_modules/@nuxtjp/localized-site/bin/nuxtjp-localized-site.mjs', 'validate', '--content-root', '.'])
run('node', ['node_modules/nuxt/bin/nuxt.mjs', 'prepare'])
run('node', ['node_modules/nuxt/bin/nuxt.mjs', 'typecheck'])
run('node', ['node_modules/nuxt/bin/nuxt.mjs', 'build'])
const port = await new Promise(done => {
  const socket = createServer().listen(0, '127.0.0.1', () => { const port = socket.address().port; socket.close(() => done(port)) })
})
const server = spawn('node', ['.output/server/index.mjs'], { cwd: root, env: { ...env, NITRO_PORT: String(port), NITRO_HOST: '127.0.0.1' }, stdio: 'ignore' })
try {
  const base = `http://127.0.0.1:${port}`
  let ready = false
  for (let i = 0; i < 40; i++) {
    try { if ((await fetch(base)).ok) { ready = true; break } } catch {}
    await new Promise(done => setTimeout(done, 250))
  }
  assert.ok(ready)
  for (const locale of ['ja', 'en']) {
    for (const path of ['/', '/docs', '/docs/getting-started', '/docs/security']) {
      const route = locale === 'ja' ? path : `/en${path === '/' ? '' : path}`
      const response = await fetch(base + route)
      assert.equal(response.status, 200)
      const html = await response.text()
      assert.ok(html.includes(`lang="${locale}"`))
      assert.ok(html.includes('rel="canonical"'))
      assert.ok(html.includes('hreflang="ja"') && html.includes('hreflang="en"'))
      assert.ok(html.includes(locale === 'ja' ? 'サンプルサービス' : 'Sample Service'))
      assert.ok(!/<a[^>]*href="(?:#|mailto:|tel:|javascript:|undefined|)"/.test(html))
    }
  }
  assert.equal((await fetch(base + '/missing-page')).status, 404)
  const lock = JSON.parse(readFileSync(join(root, 'package-lock.json'), 'utf8'))
  for (const [name, item] of Object.entries(lock.packages)) {
    if (name && name !== 'node_modules/@nuxtjp/localized-site' && item.resolved) assert.ok(item.resolved.startsWith('https://registry.npmjs.org/'))
  }
  if (process.argv[3]) run('node', [resolve(process.argv[3]), root, base])
  console.log(JSON.stringify({ root, result: 'pass', actual_archive: archive, public_dependencies: true, routes_SSR: 8, unset_links: true, CLI: true, core_validator_import: true, typecheck: true, build: true }))
} finally { server.kill('SIGTERM') }
