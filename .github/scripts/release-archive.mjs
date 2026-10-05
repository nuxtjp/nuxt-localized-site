import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync, readdirSync, lstatSync } from 'node:fs'
import { join, basename } from 'node:path'
const [mode, directory] = process.argv.slice(2)
const sha = process.env.GITHUB_SHA
if (!/^[a-f0-9]{40}$/.test(sha ?? '')) throw Error('Exact source SHA required')
if (mode === 'prepare') {
  const pack = JSON.parse(readFileSync(join(process.env.RUNNER_TEMP, 'package-pack.json')))
  if (pack.length !== 1) throw Error('Exactly one archive required')
  const p = pack[0]
  if (p.name !== '@nuxtjp/localized-site' || p.version !== '0.1.0' ||
      p.filename !== 'nuxtjp-localized-site-0.1.0.tgz') throw Error('Unexpected release identity')
  const hash = createHash('sha256').update(readFileSync(join(directory, p.filename))).digest('hex')
  writeFileSync(join(directory, 'release.json'), JSON.stringify({ source: sha, name: p.name,
    version: p.version, filename: p.filename, sha256: hash }) + '\n')
  writeFileSync(process.env.GITHUB_OUTPUT, `archive-sha256=${hash}\n`, { flag: 'a' })
} else if (mode === 'verify') {
  const record = JSON.parse(readFileSync(join(directory, 'release.json')))
  if (record.source !== sha || record.name !== '@nuxtjp/localized-site' || record.version !== '0.1.0' ||
      record.filename !== 'nuxtjp-localized-site-0.1.0.tgz' ||
      record.sha256 !== process.env.EXPECTED_ARCHIVE_SHA256 ||
      !/^[a-f0-9]{64}$/.test(record.sha256)) throw Error('Release binding mismatch')
  const files = readdirSync(directory).sort()
  if (JSON.stringify(files) !== JSON.stringify([record.filename, 'release.json'].sort()) ||
      files.some(f => !lstatSync(join(directory, f)).isFile())) throw Error('Unexpected artifact contents')
  const hash = createHash('sha256').update(readFileSync(join(directory, record.filename))).digest('hex')
  if (hash !== record.sha256) throw Error('Release archive digest mismatch')
  const { execFileSync } = await import('node:child_process')
  const manifest = JSON.parse(execFileSync('tar', ['-xOf', join(directory, record.filename), 'package/package.json']))
  if (manifest.name !== record.name || manifest.version !== record.version || manifest.private === true)
    throw Error('Archive package identity mismatch')
  console.log(basename(record.filename))
} else throw Error('Expected prepare or verify')
