import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, symlinkSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { organizationSite, organizationSites, siteDirectory, checkSitePublication } from '../organization/index.mjs'

function fixture(run) {
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-sites-'))
  try {
    for (const key of ['one', 'two']) {
      mkdirSync(join(root, 'sites', key), { recursive: true })
      writeFileSync(join(root, 'sites', key, 'site.config.json'), '{}')
    }
    return run(root)
  } finally { rmSync(root, { recursive: true, force: true }) }
}

test('Nuxt builds select only the requested content, public assets and output', () => fixture(root => {
  const config = key => organizationSite(pathToFileURL(join(root, 'nuxt.config.ts')).href, key)
  const one = config('one'), two = config('two')
  assert.notEqual(one.buildDir, two.buildDir)
  assert.notEqual(one.nitro.output.dir, two.nitro.output.dir)
  assert.equal(one.dir.public, join(root, 'sites/one/public'))
  assert.equal(one.modules[0][1].contentRoot, join(root, 'sites/one'))
  assert.deepEqual(organizationSites(root), ['one', 'two'])
}))

test('unselected, traversal, option-like and symbolic-link sites fail closed', () => fixture(root => {
  for (const key of [undefined, '../two', '/tmp', '--help', 'missing']) assert.throws(() => siteDirectory(root, key))
  symlinkSync(join(root, 'sites/one'), join(root, 'sites/alias'))
  assert.throws(() => siteDirectory(root, 'alias'))
}))

test('site-local layout and application overrides are rejected', () => fixture(root => {
  mkdirSync(join(root, 'sites/one/layouts'))
  assert.throws(() => organizationSites(root))
}))

test('public catalog remains gated after consolidation', () => fixture(root => {
  const site = join(root, 'sites/one')
  mkdirSync(join(site, 'public/catalog/v2'), { recursive: true })
  const policy = join(site, 'public-package-policy.json'), catalog = join(site, 'public/catalog/v2/index.json')
  writeFileSync(policy, JSON.stringify({ scope: 'public', repository_ids: ['synthetic-public'] }))
  assert.throws(() => checkSitePublication(root, 'one'))
  writeFileSync(catalog, JSON.stringify({ entries: [{ repository_id: 'synthetic-public' }] }))
  assert.deepEqual(checkSitePublication(root, 'one'), { scope: 'public', entries: 1 })
  writeFileSync(catalog, JSON.stringify({ entries: [{ repository_id: 'synthetic-private' }] }))
  assert.throws(() => checkSitePublication(root, 'one'))
}))

test('content-only catalog never accepts duplicated origins or site identities', async () => {
  const { runOrganizationCli } = await import('../organization/cli.mjs')
  const root = mkdtempSync(join(tmpdir(), 'nuxtjp-collision-'))
  try {
    const config = JSON.parse(readFileSync(new URL('../examples/content/site.config.json', import.meta.url)))
    for (const key of ['one', 'two']) {
      mkdirSync(join(root, 'sites', key), { recursive: true })
      writeFileSync(join(root, 'sites', key, 'site.config.json'), JSON.stringify(config))
    }
    await assert.rejects(runOrganizationCli(['check'], root), /Duplicate/)
  } finally { rmSync(root, { recursive: true, force: true }) }
})
