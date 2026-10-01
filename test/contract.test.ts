import { describe, expect, it } from 'vitest'
import { SiteContractError } from '../src/content/errors'
import { loadSiteConfig } from '../src/content/load'
import { validateSiteConfig } from '../src/content/validation/site-config'
import { contentRoot, siteFixture } from './fixture'

describe('localized site contract', () => {
  it('loads the complete ja/en example', () => {
    const config = loadSiteConfig(contentRoot)
    expect(config.defaultLocale).toBe('ja')
    expect(config.fallbackLocale).toBe('en')
    expect(config.content.ja.features).toHaveLength(3)
    expect(config.externalActions).toBe(false)
  })

  it('rejects missing English content', () => {
    const fixture = siteFixture() as {
      content: { en: { features: unknown[] } }
    }
    fixture.content.en.features.pop()
    expect(() => validateSiteConfig(fixture)).toThrowError(
      /content\.en\.features must contain exactly three/
    )
  })

  it('rejects structural drift between locales', () => {
    const fixture = siteFixture() as {
      content: { en: { features: Array<{ id: string }> } }
    }
    fixture.content.en.features[0]!.id = 'different-id'
    expect(() => validateSiteConfig(fixture)).toThrowError(
      /same ids and order in ja and en/
    )
  })

  it('fails closed for external actions and unknown fields', () => {
    const fixture = siteFixture() as Record<string, unknown>
    fixture.externalActions = true
    fixture.secret = 'must not pass'
    try {
      validateSiteConfig(fixture)
      throw new Error('validation unexpectedly passed')
    } catch (error) {
      expect(error).toBeInstanceOf(SiteContractError)
      expect((error as SiteContractError).issues).toEqual(
        expect.arrayContaining([
          'site.config.json.secret is not allowed',
          'externalActions must be false'
        ])
      )
    }
  })
})
