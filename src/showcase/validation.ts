import type { DownloadMetric, ShowcaseFeed } from './types.js'
const fail = (): never => { throw new Error('Invalid public showcase feed') }
function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return fail()
  const result = value as Record<string, unknown>
  if (Object.keys(result).sort().join() !== keys.sort().join()) return fail()
  return result
}
function text(value: unknown, limit = 1000): asserts value is string {
  if (typeof value !== 'string' || !value.trim() || value.length > limit || /[\x00-\x1f]/.test(value)) fail()
}
function url(value: unknown, hosts?: string[]): void {
  text(value, 2048)
  let parsed: URL
  try { parsed = new URL(value) } catch { return fail() }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.search || parsed.hash ||
      (hosts && !hosts.includes(parsed.hostname))) fail()
}
function timestamp(value: unknown): void {
  text(value, 32)
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(value) ||
      !Number.isFinite(Date.parse(value)) || new Date(value).toISOString() !== value.replace('Z', '.000Z')) fail()
}
function day(value: unknown): void {
  text(value, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || !Number.isFinite(Date.parse(value)) ||
      new Date(value).toISOString().slice(0, 10) !== value) fail()
}
function copy(value: unknown): void {
  const result = record(value, ['ja', 'en'])
  text(result.ja); text(result.en)
}
export function validateShowcaseFeed(input: unknown): ShowcaseFeed {
  const feed = record(input, ['schema', 'owner', 'observedAt', 'entries'])
  if (feed.schema !== 'nuxtjp://showcase/v1') fail()
  text(feed.owner, 100); timestamp(feed.observedAt)
  if (!Array.isArray(feed.entries) || feed.entries.length > 100) fail()
  const ids = new Set(), packages = new Set()
  for (const candidate of feed.entries as unknown[]) {
    const entry = record(candidate, ['id', 'kind', 'name', 'summary', 'repository', 'homepage', 'license', 'metrics'])
    text(entry.id, 100)
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(entry.id) || ids.has(entry.id)) fail()
    ids.add(entry.id); copy(entry.name); copy(entry.summary); url(entry.homepage)
    if (entry.kind !== 'oss' && entry.kind !== 'product') fail()
    if (entry.kind === 'oss') { url(entry.repository, ['github.com']); text(entry.license, 100) }
    else if (entry.repository !== null || entry.license !== null) fail()
    if (!Array.isArray(entry.metrics) || entry.metrics.length > 20 ||
        (entry.kind === 'product' && entry.metrics.length)) fail()
    for (const candidate of entry.metrics as unknown[]) {
      const metric = validateDownloadMetric(candidate)
      if (Date.parse(metric.observedAt) > Date.parse(feed.observedAt as string)) fail()
      const period = metric.period
      const key = `${metric.registry}:${metric.package}:${period.start}:${period.end}`
      if (packages.has(key)) fail()
      packages.add(key)
    }
  }
  return structuredClone(input) as ShowcaseFeed
}

export function validateDownloadMetric(input: unknown): DownloadMetric {
  const metric = record(input, ['registry', 'package', 'period', 'observedAt', 'status', 'downloads', 'source'])
  if (metric.registry !== 'npm' && metric.registry !== 'crates.io') fail()
  text(metric.package, 214)
  if (!(metric.registry === 'npm' ? /^(?:@[a-z0-9_-]+\/)?[a-z0-9_-]+$/ : /^[a-z0-9_-]+$/).test(metric.package)) fail()
  const period = record(metric.period, ['start', 'end'])
  day(period.start); day(period.end)
  if ((period.start as string) > (period.end as string)) fail()
  timestamp(metric.observedAt)
  url(metric.source, metric.registry === 'npm' ? ['api.npmjs.org'] : ['crates.io'])
  const sourcePath = decodeURIComponent(new URL(metric.source as string).pathname)
  const expectedPath = metric.registry === 'npm'
    ? `/downloads/point/${period.start}:${period.end}/${metric.package}`
    : `/api/v1/crates/${metric.package}/downloads`
  if (sourcePath !== expectedPath || (period.end as string) > (metric.observedAt as string).slice(0, 10)) fail()
  if (metric.status === 'available') {
    if (!Number.isSafeInteger(metric.downloads) || (metric.downloads as number) < 0) fail()
  } else if (metric.status !== 'unavailable' || metric.downloads !== null) fail()
  return structuredClone(input) as DownloadMetric
}
