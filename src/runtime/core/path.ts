import type {
  ContentPageId,
  ResolvedSiteConfig,
  SupportedLocale
} from '../../contracts/types'

interface RouteParts {
  pathname: string
  suffix: string
}

function routeParts(input: string): RouteParts {
  if (!input.startsWith('/') || input.startsWith('//') || input.includes('\\')) {
    throw new Error('localized routes must be absolute site paths')
  }
  const suffixIndex = [...['?', '#']]
    .map(marker => input.indexOf(marker))
    .filter(index => index >= 0)
    .sort((left, right) => left - right)[0]
  const pathname = suffixIndex === undefined ? input : input.slice(0, suffixIndex)
  const suffix = suffixIndex === undefined ? '' : input.slice(suffixIndex)
  const segments = pathname.split('/').filter(Boolean)
  if (segments.some(segment => segment === '.' || segment === '..')) {
    throw new Error('localized routes cannot traverse directories')
  }
  const normalized = segments.length === 0 ? '/' : `/${segments.join('/')}`
  return { pathname: normalized, suffix }
}

export function localeFromPath(
  path: string,
  defaultLocale: SupportedLocale
): SupportedLocale {
  const first = routeParts(path).pathname.split('/')[1]
  return first === 'ja' || first === 'en' ? first : defaultLocale
}

export function unlocalizedPath(path: string): string {
  const { pathname } = routeParts(path)
  const segments = pathname.split('/').filter(Boolean)
  if (segments[0] === 'ja' || segments[0] === 'en') segments.shift()
  return segments.length === 0 ? '/' : `/${segments.join('/')}`
}

export function localePath(
  path: string,
  locale: SupportedLocale,
  config: Pick<ResolvedSiteConfig, 'defaultLocale' | 'prefixDefaultLocale'>
): string {
  const { suffix } = routeParts(path)
  const base = unlocalizedPath(path)
  const needsPrefix = config.prefixDefaultLocale || locale !== config.defaultLocale
  const localized = needsPrefix
    ? `/${locale}${base === '/' ? '' : base}`
    : base
  return `${localized}${suffix}`
}

export function pageIdFromPath(path: string): ContentPageId | undefined {
  const pagePath = unlocalizedPath(path)
  if (pagePath === '/') return 'landing'
  if (pagePath === '/docs') return 'overview'
  if (pagePath === '/docs/getting-started') return 'gettingStarted'
  if (pagePath === '/docs/security') return 'security'
  return undefined
}

export function siteRoutes(config: ResolvedSiteConfig): string[] {
  const paths = ['/', '/docs', '/docs/getting-started', '/docs/security']
  return config.locales.flatMap(locale => paths.map(path => localePath(path, locale, config)))
}
