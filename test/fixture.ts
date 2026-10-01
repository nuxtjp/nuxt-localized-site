import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const contentRoot = fileURLToPath(
  new URL('../examples/content', import.meta.url)
)

export function siteFixture(): unknown {
  return JSON.parse(readFileSync(`${contentRoot}/site.config.json`, 'utf8')) as unknown
}
