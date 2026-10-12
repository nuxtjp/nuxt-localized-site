export * from './types.js'
export { validateShowcaseFeed } from './validation.js'
import type { DownloadMetric, MetricGroup, ShowcaseFeed } from './types.js'
import { validateShowcaseFeed } from './validation.js'
export function metricState(metric: DownloadMetric, now: number, maxAgeMs = 172800000) {
  if (!Number.isFinite(now) || !Number.isFinite(maxAgeMs) || maxAgeMs < 0) throw new Error('Invalid freshness policy')
  const age = now - Date.parse(metric.observedAt)
  if (age < 0 || age > maxAgeMs) return 'stale' as const
  return metric.status
}
export function summarizeDownloads(input: ShowcaseFeed, now: number, maxAgeMs?: number): MetricGroup[] {
  const feed = validateShowcaseFeed(input), groups = new Map<string, MetricGroup>()
  for (const entry of feed.entries) for (const metric of entry.metrics) {
    const { start, end } = metric.period, key = `${metric.registry}:${start}:${end}`
    const group = groups.get(key) ?? { registry: metric.registry, start, end, downloads: 0, available: 0, unavailable: 0, stale: 0 }
    const status = metricState(metric, now, maxAgeMs)
    if (status === 'available') {
      const total = group.downloads + metric.downloads!
      if (!Number.isSafeInteger(total)) throw new Error('Download total exceeds safe integer')
      group.downloads = total; group.available++
    } else group[status]++
    groups.set(key, group)
  }
  return [...groups.values()]
}
