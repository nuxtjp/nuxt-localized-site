import { describe, expect, it } from 'vitest'
import { loadSiteConfig } from '../src/content/load'
import {
  localeFromPath,
  localePath,
  pageIdFromPath,
  siteRoutes
} from '../src/runtime/core/path'
import { contentRoot } from './fixture'

describe('locale URL policy', () => {
  const config = loadSiteConfig(contentRoot)

  it('leaves the default locale unprefixed', () => {
    expect(localePath('/docs?from=home#top', 'ja', config))
      .toBe('/docs?from=home#top')
    expect(localePath('/docs?from=home#top', 'en', config))
      .toBe('/en/docs?from=home#top')
  })

  it('replaces an existing locale prefix', () => {
    expect(localePath('/en/docs/security', 'ja', config))
      .toBe('/docs/security')
    expect(localeFromPath('/en/docs', 'ja')).toBe('en')
    expect(pageIdFromPath('/en/docs/getting-started')).toBe('gettingStarted')
  })

  it('injects exactly four pages for both locales', () => {
    expect(siteRoutes(config)).toEqual([
      '/',
      '/docs',
      '/docs/getting-started',
      '/docs/security',
      '/en',
      '/en/docs',
      '/en/docs/getting-started',
      '/en/docs/security'
    ])
  })

  it('rejects external and traversing paths', () => {
    expect(() => localePath('https://example.test/docs', 'ja', config)).toThrow()
    expect(() => localePath('/docs/../private', 'ja', config)).toThrow()
  })
})
