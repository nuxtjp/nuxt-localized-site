#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'
import { organizationSites } from './index.mjs'

const [command, input] = process.argv.slice(2)
if (!['module', 'verify'].includes(command) || !input || process.argv.length !== 4) {
  throw new Error('usage: workspace.mjs <module|verify> WORKSPACE_ROOT')
}
const root = resolve(input)
const moduleRoot = join(root, 'organizations/nuxtjp/nuxt-localized-site')
if (command === 'module') console.log(moduleRoot)
else {
  for (const organization of readdirSync(join(root, 'organizations'), { withFileTypes: true })) {
    if (!organization.isDirectory() || organization.isSymbolicLink()) continue
    const owner = join(root, 'organizations', organization.name)
    for (const entry of readdirSync(owner, { withFileTypes: true })) {
      if (!entry.isDirectory() || entry.isSymbolicLink()) continue
      const repository = join(owner, entry.name)
      if (!existsSync(join(repository, 'sites')) || !existsSync(join(repository, 'package.json'))) continue
      const manifest = JSON.parse(readFileSync(join(repository, 'package.json'), 'utf8'))
      if (!manifest.dependencies?.['@nuxtjp/localized-site']) continue
      const commands = [['test'], ...organizationSites(repository).flatMap(key => [['site', 'typecheck', key], ['site', 'build', key]])]
      for (const args of commands) {
        const result = spawnSync('pnpm', args, { cwd: repository, stdio: 'inherit' })
        if (result.status !== 0) process.exit(result.status ?? 1)
      }
    }
  }
}
