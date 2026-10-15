import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs'
import { resolve, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateContent } from './service-site/check.mjs'

// One-time adoption. Existing owner customization is never overwritten.
export function adopt(directory, manifest) {
  const data = JSON.parse(readFileSync(manifest, 'utf8'))
  const receipt = validateContent(data)
  const target = resolve(directory)
  if (existsSync(target)) throw Error('Choose a new scaffold directory; existing site files are owner-managed')
  mkdirSync(target)
  cpSync(new URL('./service-site/', import.meta.url), target, { recursive: true, errorOnExist: true })
  writeFileSync(join(target, 'content.json'), JSON.stringify(data, null, 2) + '\n')
  for (const name of ['LICENSE', 'NOTICE']) copyFileSync(new URL('../' + name, import.meta.url), join(target, name))
  return receipt
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) throw Error('Usage: node templates/adopt.mjs NEW_DIRECTORY REVIEWED_CONTENT_JSON')
  console.log(JSON.stringify(adopt(process.argv[2], process.argv[3])))
}
