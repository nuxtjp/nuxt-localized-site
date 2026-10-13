import { createProviderHttpTransport } from '@crowsi/provider-http-transport'
import type { DownloadMetric } from './types.js'
import { validateDownloadMetric } from './validation.js'

export interface DownloadCollectionOptions {
  now: number
  fetchImplementation?: typeof fetch
  timeoutMs?: number
}
const dayMs = 86400000
function count(value: unknown): number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) throw new Error('Invalid download count')
  return value as number
}
function crateCount(payload: unknown, metric: DownloadMetric): number {
  const data = payload as { version_downloads: { version: number; date: string; downloads: number }[]; meta: { extra_downloads: { date: string; downloads: number }[] } }
  if (!Array.isArray(data?.version_downloads) || !Array.isArray(data?.meta?.extra_downloads)) throw new Error('Missing daily observations')
  const daily = new Map<string, number>(), seen = new Set<string>()
  for (const row of [...data.version_downloads.map(row => ({ ...row, key: `version:${count(row.version)}:${row.date}` })),
    ...data.meta.extra_downloads.map(row => ({ ...row, key: `extra:${row.date}` }))]) {
    if (typeof row.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(row.date) ||
      new Date(row.date).toISOString().slice(0, 10) !== row.date || seen.has(row.key)) throw new Error('Invalid daily observation')
    seen.add(row.key)
    const total = count((daily.get(row.date) ?? 0) + count(row.downloads))
    daily.set(row.date, total)
  }
  let total = 0
  for (let day = Date.parse(metric.period.start); day <= Date.parse(metric.period.end); day += dayMs) {
    const value = daily.get(new Date(day).toISOString().slice(0, 10))
    if (value === undefined) throw new Error('Incomplete period')
    total = count(total + value)
  }
  return total
}
/** Explicit public-registry read only. No authentication, automatic retries or polling. */
export async function collectDownloads(registry: DownloadMetric['registry'], packageName: string,
  period: DownloadMetric['period'], options: DownloadCollectionOptions): Promise<DownloadMetric> {
  const observedAt = new Date(options.now).toISOString().replace(/\.\d{3}Z$/, 'Z')
  const source = registry === 'npm'
    ? `https://api.npmjs.org/downloads/point/${period.start}:${period.end}/${encodeURIComponent(packageName)}`
    : `https://crates.io/api/v1/crates/${encodeURIComponent(packageName)}/downloads`
  const metric = validateDownloadMetric({ registry, package: packageName, period, observedAt, status: 'unavailable', downloads: null, source })
  const length = (Date.parse(period.end) - Date.parse(period.start)) / dayMs + 1
  if (length > 31 || period.end >= observedAt.slice(0, 10)) throw new Error('Use 1–31 complete UTC days')
  const transport = createProviderHttpTransport({ allowedOrigins: [new URL(source).origin],
    maximumRequestBytes: 1, maximumResponseBytes: 131072, timeoutMs: options.timeoutMs ?? 15000,
    ...(options.fetchImplementation ? { fetchImplementation: options.fetchImplementation } : {}) })
  try {
    const response = await transport.request({ url: source, method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': 'NuxtJP-public-showcase/0.2.0 (https://github.com/nuxtjp/site-builder)' } })
    if (response.status !== 200) return metric
    const data = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(response.body)) as Record<string, unknown>
    const downloads = registry === 'npm'
      ? (data.package === packageName && data.start === period.start && data.end === period.end
        ? count(data.downloads) : (() => { throw new Error('Mismatched registry observation') })())
      : crateCount(data, metric)
    return { ...metric, status: 'available', downloads }
  } catch { return metric }
}
