import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from 'node:fs'
import { dirname, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import assert from 'node:assert/strict'

const keyPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function directory(path) {
  if (!existsSync(path) || lstatSync(path).isSymbolicLink() || !lstatSync(path).isDirectory()) {
    throw new Error('Expected a real organization site directory')
  }
  return realpathSync(path)
}

export function organizationSites(root) {
  const sites = directory(join(directory(root), 'sites'))
  const keys = readdirSync(sites).sort()
  if (!keys.length) throw new Error('No organization sites configured')
  for (const key of keys) siteDirectory(root, key)
  return keys
}

export function siteDirectory(root, key) {
  if (typeof key !== 'string' || !keyPattern.test(key)) throw new Error('Invalid SITE_ID')
  const sites = directory(join(directory(root), 'sites'))
  const path = directory(join(sites, key))
  if (dirname(path) !== sites) throw new Error('Site must remain within sites/')
  const config = join(path, 'site.config.json')
  if (!existsSync(config) || lstatSync(config).isSymbolicLink() || !lstatSync(config).isFile()) {
    throw new Error('Site configuration must be a regular file')
  }
  for (const name of ['package.json', 'nuxt.config.ts', 'app.vue', 'layouts', 'pages', 'components']) {
    if (existsSync(join(path, name))) throw new Error('Site-specific Nuxt applications/layouts are not permitted')
  }
  return path
}

export function organizationSite(configUrl, key = process.env.SITE_ID, presentation) {
  const root = dirname(fileURLToPath(configUrl))
  const contentRoot = siteDirectory(root, key)
  return {
    srcDir: dirname(fileURLToPath(import.meta.url)),
    devtools: { enabled: false },
    buildDir: join(root, '.nuxt', key),
    dir: { public: join(contentRoot, 'public') },
    modules: [['@nuxtjp/localized-site', { contentRoot, maintenance: existsSync(join(contentRoot, 'public/maintenance.json')), ...(presentation ? { presentation } : {}) }]],
    nitro: {
      output: { dir: join(root, '.output', key) },
      prerender: { failOnError: true }
    }
  }
}

export function checkPublicCatalog(policy, catalog) {
  assert.equal(policy.scope, 'public')
  assert.ok(Array.isArray(policy.repository_ids) && policy.repository_ids.length > 0)
  assert.equal(new Set(policy.repository_ids).size, policy.repository_ids.length)
  assert.ok(Array.isArray(catalog.entries))
  assert.deepEqual(catalog.entries.map(entry => entry.repository_id).sort(), [...policy.repository_ids].sort(),
    'Catalog visibility gate failed: entries must match the reviewed public allowlist exactly')
  return { scope: 'public', entries: catalog.entries.length }
}

export function checkSitePublication(root, key) {
  const path = siteDirectory(root, key)
  const policy = join(path, 'public-package-policy.json')
  const catalog = join(path, 'public/catalog/v2/index.json')
  if (existsSync(policy) || existsSync(catalog)) {
    for (const file of [policy, catalog]) {
      if (!existsSync(file) || lstatSync(file).isSymbolicLink() || !lstatSync(file).isFile()) {
        throw new Error('Public catalog and reviewed policy must both exist as regular files')
      }
    }
    return checkPublicCatalog(JSON.parse(readFileSync(policy, 'utf8')), JSON.parse(readFileSync(catalog, 'utf8')))
  }
  return null
}

// Only a reviewed public snapshot is embedded; no browser registry/account requests.
export async function loadOrganizationShowcase(contentRoot, snapshotName = 'showcase.json') {
  if (!['showcase.json', 'organizations.json'].includes(snapshotName)) throw new Error('Unknown public snapshot name')
  const root = directory(contentRoot)
  const file = join(root, 'public', 'oss', snapshotName)
  if (!existsSync(file)) return null
  directory(join(root, 'public'))
  directory(join(root, 'public', 'oss'))
  if (lstatSync(file).isSymbolicLink() || !lstatSync(file).isFile() ||
      !realpathSync(file).startsWith(root + sep) || lstatSync(file).size > 262144) {
    throw new Error('Showcase must be a bounded regular public snapshot')
  }
  const { validateShowcaseFeed } = await import('../validator/showcase/index.js')
  return validateShowcaseFeed(JSON.parse(readFileSync(file, 'utf8')))
}
