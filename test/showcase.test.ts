import { describe, expect, it } from 'vitest'
import fixture from '../playground/data/showcase.json'
import { summarizeDownloads, validateShowcaseFeed } from '../src/showcase/index'
const now = Date.parse(fixture.observedAt)
describe('public showcase', () => {
  it('keeps products separate and supports language-independent owner feeds', () => {
    const feed = validateShowcaseFeed(fixture)
    expect(feed.entries[1]?.repository).toBeNull()
    expect(summarizeDownloads(feed, now)[0]?.downloads).toBe(1234)
    feed.entries[0]!.name.en = 'changed'
    expect(fixture.entries[0]!.name.en).not.toBe('changed')
  })
  it('does not turn unavailable or stale observations into measured zero', () => {
    const feed = validateShowcaseFeed(fixture), metric = feed.entries[0]!.metrics[0]!
    metric.status = 'unavailable'; metric.downloads = null
    expect(summarizeDownloads(feed, now)[0]).toMatchObject({ available: 0, unavailable: 1 })
    expect(summarizeDownloads(validateShowcaseFeed(fixture), now + 172800001)[0]).toMatchObject({ available: 0, stale: 1 })
    expect(summarizeDownloads(validateShowcaseFeed(fixture), now - 1)[0]?.stale).toBe(1)
  })
  it('never combines registries or different periods', () => {
    const feed = validateShowcaseFeed(fixture), metric = feed.entries[0]!.metrics[0]!
    feed.entries[0]!.metrics.push({ ...metric, registry: 'crates.io', package: 'example-parser', source: 'https://crates.io/api/v1/crates/example-parser/downloads' })
    feed.entries[0]!.metrics.push({ ...metric, period: { start: '2026-10-02', end: '2026-10-07' }, source: 'https://api.npmjs.org/downloads/point/2026-10-02:2026-10-07/@example/parser' })
    expect(summarizeDownloads(feed, now)).toHaveLength(3)
  })
  it('rejects secret fields, malformed dates, duplicate counting and private product details', () => {
    const invalid: unknown[] = [{ ...fixture, token: 'not-a-real-secret' }]
    const missingTranslation = structuredClone(fixture); missingTranslation.entries[0]!.name.en = ''; invalid.push(missingTranslation)
    for (const patch of [{ observedAt: '2026-02-30T00:00:00Z' }, { repository: 'https://user:secret@github.com/example/parser' }]) {
      const feed = structuredClone(fixture); Object.assign(feed.entries[0]!, patch); invalid.push(feed)
    }
    const duplicate = validateShowcaseFeed(fixture)
    duplicate.entries[0]!.metrics.push(duplicate.entries[0]!.metrics[0]!)
    invalid.push(duplicate)
    const product = structuredClone(fixture); product.entries[1]!.repository = 'https://github.com/example/private'; invalid.push(product)
    for (const feed of invalid) expect(() => validateShowcaseFeed(feed)).toThrow('Invalid public showcase feed')
  })
})
