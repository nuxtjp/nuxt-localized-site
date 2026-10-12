import { expect, it } from 'vitest'
import { collectDownloads } from '../src/showcase/collectors'
const period = { start: '2026-10-01', end: '2026-10-02' }, now = Date.parse('2026-10-03T00:00:00Z')
const fake = (data: unknown, status = 200): typeof fetch => async () => new Response(JSON.stringify(data), { status })
it('records exact npm observations including measured zero without credential use', async () => {
  const metric = await collectDownloads('npm', '@example/parser', period, { now: now + 123, fetchImplementation: async (url, init) => {
    expect(String(url)).toContain('https://api.npmjs.org/downloads/point/2026-10-01:2026-10-02/')
    expect(new Headers(init?.headers).has('authorization')).toBe(false)
    return new Response(JSON.stringify({ package: '@example/parser', ...period, downloads: 0 }))
  } })
  expect(metric).toMatchObject({ status: 'available', downloads: 0 })
})
it('combines crate version and extra daily observations only for complete declared days', async () => {
  const data = { version_downloads: [{ version: 1, date: period.start, downloads: 5 }, { version: 1, date: period.end, downloads: 7 }], meta: { extra_downloads: [{ date: period.start, downloads: 2 }, { date: period.end, downloads: 3 }] } }
  expect(await collectDownloads('crates.io', 'example-parser', period, { now, fetchImplementation: fake(data) })).toMatchObject({ status: 'available', downloads: 17 })
  data.meta.extra_downloads = []
  data.version_downloads.pop()
  expect(await collectDownloads('crates.io', 'example-parser', period, { now, fetchImplementation: fake(data) })).toMatchObject({ status: 'unavailable', downloads: null })
})
it('does not publish mismatched, duplicate, denied, oversized or timed-out observations as zero', async () => {
  for (const fetchImplementation of [fake({ downloads: 2, package: 'other', ...period }), fake({}, 403),
    fake('x'.repeat(131073)), async () => new Promise<Response>(() => {})]) {
    expect(await collectDownloads('npm', 'example-parser', period, { now, timeoutMs: 5, fetchImplementation })).toMatchObject({ status: 'unavailable', downloads: null })
  }
  const duplicate = { version_downloads: [{ version: 1, date: period.start, downloads: 1 }, { version: 1, date: period.start, downloads: 1 }], meta: { extra_downloads: [] } }
  expect((await collectDownloads('crates.io', 'example-parser', period, { now, fetchImplementation: fake(duplicate) })).status).toBe('unavailable')
})
it('rejects invalid package/date ranges before any transport call', async () => {
  let calls = 0
  const fetchImplementation: typeof fetch = async () => { calls++; return new Response('{}') }
  for (const input of [{ package: '../other', period }, { package: 'example', period: { start: '2026-02-30', end: '2026-03-01' } },
    { package: 'example', period: { start: '2026-09-01', end: '2026-10-02' } }, { package: 'example', period: { start: '2026-10-03', end: '2026-10-03' } }]) {
    await expect(collectDownloads('npm', input.package, input.period, { now, fetchImplementation })).rejects.toThrow()
  }
  expect(calls).toBe(0)
})
