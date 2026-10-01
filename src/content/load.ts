import { readFileSync, realpathSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { ResolvedSiteConfig } from '../contracts/types.js'
import { SiteContractError } from './errors.js'
import { validateSiteConfig } from './validation/site-config.js'

export function loadSiteConfig(contentRoot: string): ResolvedSiteConfig {
  let root: string
  try {
    root = realpathSync(contentRoot)
    if (!statSync(root).isDirectory()) throw new Error('not a directory')
  } catch {
    throw new SiteContractError([`content root is not a readable directory: ${contentRoot}`])
  }
  const file = join(root, 'site.config.json')
  let parsed: unknown
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8')) as unknown
  } catch (error) {
    const detail = error instanceof Error ? error.message : 'unknown read error'
    throw new SiteContractError([`cannot read ${file}: ${detail}`])
  }
  return validateSiteConfig(parsed)
}
