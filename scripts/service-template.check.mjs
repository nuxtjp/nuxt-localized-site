import test from 'node:test'
import assert from 'node:assert/strict'
import { validateContent } from '../templates/service-site/check.mjs'
function fixture() {
  const paths = ['/', '/docs', '/journal', '/privacy', '/security', '/sitemap']
  const locales = Object.fromEntries(['ja', 'en'].map(locale => [locale, {
    brand: 'Example', locale, accent: '#008877', icon: '/brand/icon.svg', navigation: [{ title: 'Docs', href: '/docs' }], resources: [],
    pages: paths.map(path => ({ path, title: 'Example', summary: 'Example description.', status: 'published', kind: path === '/' ? 'home' : 'page', sections: [] }))
  }]))
  return { siteId: 'example-site', origin: 'https://example.org', defaultLocale: 'en', locales }
}
test('Published bilingual routes produce one finite navigation graph', () => {
  assert.equal(validateContent(fixture()).pages, 12)
})
test('Broken links and duplicate routes stop before prerender', () => {
  const broken = fixture(); broken.locales.ja.navigation[0].href = '/missing'
  assert.throws(() => validateContent(broken), /broken internal link/)
  const duplicate = fixture(); for (const c of Object.values(duplicate.locales)) c.pages.push(c.pages[0])
  assert.throws(() => validateContent(duplicate), /duplicate routes/)
})
test('Drafts and empty articles cannot become bundled public content', () => {
  const draft = fixture(); draft.locales.ja.pages[0].status = 'draft'
  assert.throws(() => validateContent(draft), /draft content/)
  const article = fixture(); article.locales.ja.pages[0].kind = 'article'
  assert.throws(() => validateContent(article), /empty published article/)
})
test('Missing translations, route injection and executable links are rejected', () => {
  const translation = fixture(); translation.locales.en.pages.pop()
  assert.throws(() => validateContent(translation), /translation routes/)
  for (const href of ['javascript:alert(1)', '//evil.example', 'https://user:password@example.org']) {
    const data = fixture(); data.locales.ja.navigation[0].href = href
    assert.throws(() => validateContent(data))
  }
  const injection = fixture(); for (const c of Object.values(injection.locales)) c.pages[0].path = '/<script>'
  assert.throws(() => validateContent(injection))
})
