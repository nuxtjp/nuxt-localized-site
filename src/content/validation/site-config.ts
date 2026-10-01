import type {
  AudienceScope,
  ResolvedSiteConfig,
  SiteConfig
} from '../../contracts/types.js'
import { SITE_CONFIG_SCHEMA } from '../../contracts/types.js'
import { SiteContractError } from '../errors.js'
import { validateCompleteness } from './completeness.js'
import { localeContent } from './locale-content.js'
import {
  exactBoolean,
  identifier,
  locale,
  onlyKeys,
  record,
  text
} from './primitives.js'

const rootKeys = [
  'schema',
  'siteId',
  'serviceId',
  'origin',
  'audienceScope',
  'defaultLocale',
  'fallbackLocale',
  'prefixDefaultLocale',
  'locales',
  'externalActions',
  'content'
] as const

function origin(value: unknown, issues: string[]): string {
  const input = text(value, 'origin', issues, 500)
  try {
    const parsed = new URL(input)
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('protocol')
    if (parsed.username || parsed.password || parsed.search || parsed.hash) throw new Error('parts')
    parsed.pathname = parsed.pathname === '/' ? '' : parsed.pathname.replace(/\/+$/, '')
    return parsed.toString().replace(/\/$/, '')
  } catch {
    issues.push('origin must be an HTTP(S) URL without credentials, query, or fragment')
    return 'http://localhost'
  }
}

function audience(value: unknown, issues: string[]): AudienceScope {
  if (value !== 'japan' && value !== 'global') {
    issues.push('audienceScope must be japan or global')
    return 'japan'
  }
  return value
}

function locales(value: unknown, issues: string[]): ['ja', 'en'] {
  if (!Array.isArray(value) || value.length !== 2 || value[0] !== 'ja' || value[1] !== 'en') {
    issues.push('locales must be exactly ["ja", "en"]')
  }
  return ['ja', 'en']
}

export function validateSiteConfig(value: unknown): ResolvedSiteConfig {
  const issues: string[] = []
  const root = record(value, 'site.config.json', issues)
  onlyKeys(root, rootKeys, 'site.config.json', issues)
  if (root.schema !== SITE_CONFIG_SCHEMA) {
    issues.push(`schema must be ${SITE_CONFIG_SCHEMA}`)
  }
  const defaultLocale = locale(root.defaultLocale, 'defaultLocale', issues)
  const fallbackLocale = root.fallbackLocale === undefined
    ? (defaultLocale === 'ja' ? 'en' : 'ja')
    : locale(root.fallbackLocale, 'fallbackLocale', issues)
  const prefixDefaultLocale = root.prefixDefaultLocale === undefined
    ? false
    : exactBoolean(root.prefixDefaultLocale, root.prefixDefaultLocale === true, 'prefixDefaultLocale', issues)
  const content = record(root.content, 'content', issues)
  onlyKeys(content, ['ja', 'en'], 'content', issues)
  const ja = localeContent(content.ja, 'content.ja', issues)
  const en = localeContent(content.en, 'content.en', issues)
  validateCompleteness(ja, en, issues)
  exactBoolean(root.externalActions, false, 'externalActions', issues)
  const result: ResolvedSiteConfig = {
    schema: SITE_CONFIG_SCHEMA,
    siteId: identifier(root.siteId, 'siteId', issues),
    serviceId: identifier(root.serviceId, 'serviceId', issues),
    origin: origin(root.origin, issues),
    audienceScope: audience(root.audienceScope, issues),
    defaultLocale,
    fallbackLocale,
    prefixDefaultLocale,
    locales: locales(root.locales, issues),
    externalActions: false,
    content: { ja, en }
  }
  if (issues.length > 0) throw new SiteContractError(issues)
  return result
}

export function defineSiteConfig<const Config extends SiteConfig>(config: Config): Config {
  validateSiteConfig(config)
  return config
}
