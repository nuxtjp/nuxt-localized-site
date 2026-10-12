export type Locale = 'ja' | 'en'
export type Copy = { ja: string; en: string }
export interface DownloadMetric {
  registry: 'npm' | 'crates.io'
  package: string
  period: { start: string; end: string }
  observedAt: string
  status: 'available' | 'unavailable'
  downloads: number | null
  source: string
}
export interface ShowcaseEntry {
  id: string
  kind: 'oss' | 'product'
  name: Copy
  summary: Copy
  repository: string | null
  homepage: string
  license: string | null
  metrics: DownloadMetric[]
}
export interface ShowcaseFeed {
  schema: 'nuxtjp://showcase/v1'
  owner: string
  observedAt: string
  entries: ShowcaseEntry[]
}
export interface MetricGroup {
  registry: DownloadMetric['registry']
  start: string
  end: string
  downloads: number
  available: number
  unavailable: number
  stale: number
}
