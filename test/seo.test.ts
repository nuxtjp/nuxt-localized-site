import { describe, expect, it } from 'vitest'
import { loadSiteConfig } from '../src/content/load'
import { localizedHead } from '../src/runtime/core/seo'
import { contentRoot } from './fixture'

describe('localized SEO projection', () => {
  const config = loadSiteConfig(contentRoot)

  it('emits lang, canonical, alternates, and description', () => {
    const head = localizedHead('/en/docs?preview=1#section', config)
    expect(head.htmlAttrs.lang).toBe('en')
    expect(head.title).toBe('Overview | Sample Service')
    expect(head.link).toEqual([
      { rel: 'canonical', href: 'https://example.test/en/docs' },
      { rel: 'alternate', hreflang: 'ja', href: 'https://example.test/docs' },
      { rel: 'alternate', hreflang: 'en', href: 'https://example.test/en/docs' },
      { rel: 'alternate', hreflang: 'x-default', href: 'https://example.test/docs' }
    ])
    expect(head.meta).toContainEqual({
      name: 'description',
      content: 'Understand the service structure and responsibility.'
    })
  })

  it('canonicalizes an explicit default-locale prefix', () => {
    const head = localizedHead('/ja/docs/security', config)
    expect(head.htmlAttrs.lang).toBe('ja')
    expect(head.link[0]).toEqual({
      rel: 'canonical',
      href: 'https://example.test/docs/security'
    })
  })
})
