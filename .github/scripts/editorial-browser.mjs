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
      assert.ok(!(await page.locator('.editorial-brand').innerText()).includes('·'))
      await page.evaluate(() => scrollTo(0, 600))
      await page.waitForTimeout(100)
      const header = await page.locator('.editorial-header').evaluate(element => ({ top: element.getBoundingClientRect().top, position: getComputedStyle(element).position, background: getComputedStyle(element).backgroundColor }))
      assert.equal(header.position, 'sticky')
      assert.ok(Math.abs(header.top) <= 1, `Header scrolled away: ${header.top}`)
      assert.notEqual(header.background, 'rgba(0, 0, 0, 0)')
      await page.evaluate(() => scrollTo(0, 0))
      if (scope === 'product') {
        assert.equal(await page.locator('.product-landing').count(), 1)
        assert.equal(await page.locator('a[href$="/oss"]').count(), 0)
        assert.equal(await page.locator('.editorial-adoption').count(), 0)
        assert.ok(!(await page.locator('body').innerText()).includes('OPEN SOURCE'))
        assert.equal(await page.locator('nav a[href$="/docs/getting-started"]').count(), 1)
      } else {
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
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false)
    }
    assert.deepEqual(errors, [])
    await page.close()
  }
} finally { await browser.close() }
console.log(JSON.stringify({ editorial: scope, locales: 2, viewports: 2, scopeSeparation: true }))
