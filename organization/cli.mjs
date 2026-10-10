import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, dirname } from 'node:path'
import { organizationSites, siteDirectory, checkSitePublication } from './index.mjs'
import { loadSiteConfig } from '../validator/content/index.js'
import { localizedHead, siteRoutes } from '../dist/runtime/core/index.js'

export async function runOrganizationCli(args, root = process.cwd()) {
  const [command, key, ...extra] = args
  if (extra.length || !['list', 'check', 'dev', 'build', 'typecheck', 'preview'].includes(command)) {
    throw new Error('usage: nuxtjp-localized-site site <list|check|dev|build|typecheck|preview> [SITE_ID]')
  }
  const keys = organizationSites(root)
  if (key !== undefined) siteDirectory(root, key)
  if (command === 'list') { console.log(JSON.stringify(keys)); return 0 }
  const selected = key === undefined ? keys : [key]
  const all = keys.map(id => loadSiteConfig(siteDirectory(root, id)))
  for (const field of ['siteId', 'origin']) {
    assert.equal(new Set(all.map(config => config[field])).size, all.length, `Duplicate ${field}`)
  }
  for (const id of selected) {
    const config = loadSiteConfig(siteDirectory(root, id))
    const routes = siteRoutes(config)
    assert.equal(config.externalActions, false)
    assert.equal(config.defaultLocale, config.audienceScope === 'japan' ? 'ja' : 'en')
    assert.equal(new Set(routes).size, routes.length)
    assert.equal(routes.length, 8)
    for (const route of routes) {
      const head = localizedHead(route, config)
      assert.ok(head.link.some(link => link.rel === 'canonical' && new URL(link.href).origin === new URL(config.origin).origin))
    }
    checkSitePublication(root, id)
    if (command === 'check') console.log(JSON.stringify({ site: id, siteId: config.siteId, routes: routes.length }))
  }
  if (command === 'check') return 0
  if (key === undefined) throw new Error('SITE_ID is required for Nuxt commands')
  // Resolve the installed consumer CLI without a shell or a package-manager download.
  const require = createRequire(join(root, 'package.json'))
  const manifestPath = require.resolve('nuxt/package.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const bin = typeof manifest.bin === 'string' ? manifest.bin : manifest.bin.nuxt
  if (!bin) throw new Error('Installed Nuxt CLI not found')
  const run = (file, args) => new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [file, ...args], {
      cwd: root, stdio: 'inherit', env: { ...process.env, SITE_ID: key, NUXT_TELEMETRY_DISABLED: '1' }
    })
    child.on('error', reject)
    child.on('exit', (code, signal) => resolve(signal ? 1 : code ?? 1))
  })
  if (command === 'typecheck') {
    const prepared = await run(join(dirname(manifestPath), bin), ['prepare'])
    if (prepared !== 0) return prepared
    return await run(require.resolve('vue-tsc/bin/vue-tsc.js'), ['--noEmit', '--project', join(root, '.nuxt', key, 'tsconfig.json')])
  }
  return await run(join(dirname(manifestPath), bin), [command === 'build' ? 'generate' : command])
}
