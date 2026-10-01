export const SITE_CONFIG_SCHEMA = 'nuxtjp://localized-site/site-config/v1'
export const SUPPORTED_LOCALES = ['ja', 'en'] as const
export const DOCUMENT_IDS = ['overview', 'gettingStarted', 'security'] as const

export type SupportedLocale = typeof SUPPORTED_LOCALES[number]
export type DocumentId = typeof DOCUMENT_IDS[number]
export type AudienceScope = 'japan' | 'global'

export interface FeatureContent {
  id: string
  title: string
  summary: string
}

export interface DocumentSection {
  id: string
  title: string
  body: string[]
}

export interface DocumentContent {
  slug: string
  title: string
  summary: string
  sections: DocumentSection[]
}

export interface NoticeContent {
  label: string
  summary: string
}

export interface LocaleContent {
  brand: string
  tagline: string
  summary: string
  features: FeatureContent[]
  docs: Record<DocumentId, DocumentContent>
  privacy: NoticeContent
  contact: NoticeContent
}

export interface SiteConfig {
  schema: typeof SITE_CONFIG_SCHEMA
  siteId: string
  serviceId: string
  origin: string
  audienceScope: AudienceScope
  defaultLocale: SupportedLocale
  fallbackLocale?: SupportedLocale
  prefixDefaultLocale?: boolean
  locales: ['ja', 'en']
  externalActions: false
  content: Record<SupportedLocale, LocaleContent>
}

export interface ResolvedSiteConfig extends Omit<
  SiteConfig,
  'fallbackLocale' | 'prefixDefaultLocale'
> {
  fallbackLocale: SupportedLocale
  prefixDefaultLocale: boolean
}

export type ContentPageId = 'landing' | DocumentId
