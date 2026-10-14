import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
const [base, scope] = process.argv.slice(2)
const browser = await chromium.launch({ headless: true })
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    for (const prefix of ['', '/en']) {
      await page.goto(`${base}${prefix || '/'}`)
      assert.equal(await page.locator('.editorial-shell').count(), 1)
      assert.equal(await page.locator('.editorial-hero').count(), 1)
      await page.goto(`${base}${prefix}/oss`)
      assert.equal(await page.locator('.editorial-catalog').count(), 1)
      if (scope === 'portfolio') {
        assert.equal(await page.locator('.organization-directory article').count(), 1)
        assert.equal(await page.locator('[data-showcase="modules"]').count(), 0)
        assert.equal((await page.request.get(`${base}${prefix}/oss/example-parser`)).status(), 404)
      } else {
        assert.equal(await page.locator('[data-showcase="modules"]').count(), 1)
        assert.equal(await page.locator('.organization-directory').count(), 0)
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    }
    assert.deepEqual(errors, [])
    await page.close()
  }
} finally { await browser.close() }
console.log(JSON.stringify({ editorial: scope, locales: 2, viewports: 2, scopeSeparation: true }))
