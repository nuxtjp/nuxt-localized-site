import type {
  ResolvedSiteConfig,
  SupportedLocale
} from '../../contracts/types'
import { localeFromPath, localePath, pageIdFromPath } from './path'

export interface HeadLink {
  rel: 'canonical' | 'alternate'
  href: string
  hreflang?: string
}

export interface HeadMeta {
  name?: string
  property?: string
  content: string
}

export interface LocalizedHead {
  title: string
  htmlAttrs: { lang: SupportedLocale }
  link: HeadLink[]
  meta: HeadMeta[]
}

function absoluteUrl(
  path: string,
  locale: SupportedLocale,
  config: ResolvedSiteConfig
): string {
  const site = new URL(config.origin)
  const base = site.pathname === '/' ? '' : site.pathname.replace(/\/+$/, '')
  const localized = localePath(path.split(/[?#]/, 1)[0] ?? '/', locale, config)
  site.pathname = `${base}${localized === '/' ? '/' : localized}`
  site.search = ''
  site.hash = ''
  return site.toString()
}

function pageText(path: string, locale: SupportedLocale, config: ResolvedSiteConfig) {
  const content = config.content[locale]
  const pageId = pageIdFromPath(path)
  if (!pageId || pageId === 'landing') {
    return { title: content.brand, description: content.summary }
  }
  const document = content.docs[pageId]
  return {
    title: `${document.title} | ${content.brand}`,
    description: document.summary
  }
}

export function localizedHead(path: string, config: ResolvedSiteConfig): LocalizedHead {
  const locale = localeFromPath(path, config.defaultLocale)
  const page = pageText(path, locale, config)
  const canonical = absoluteUrl(path, locale, config)
  const alternates = config.locales.map(alternate => ({
    rel: 'alternate' as const,
    hreflang: alternate,
    href: absoluteUrl(path, alternate, config)
  }))
  return {
    title: page.title,
    htmlAttrs: { lang: locale },
    link: [
      { rel: 'canonical', href: canonical },
      ...alternates,
      {
        rel: 'alternate',
        hreflang: 'x-default',
        href: absoluteUrl(path, config.defaultLocale, config)
      }
    ],
    meta: [
      { name: 'description', content: page.description },
      { property: 'og:locale', content: locale === 'ja' ? 'ja_JP' : 'en_US' },
      { property: 'og:url', content: canonical },
      { property: 'og:title', content: page.title },
      { property: 'og:description', content: page.description }
    ]
  }
}
