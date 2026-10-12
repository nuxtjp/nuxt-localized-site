import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
const base = process.argv[2]
assert.ok(/^http:\/\/127\.0\.0\.1:\d+$/.test(base ?? ''))
const browser = await chromium.launch({ headless: true })
try {
  for (const width of [1280, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } }), errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(`${base}/oss`)
    await page.getByRole('heading', { name: '文書解析の例' }).waitFor()
    assert.ok((await page.locator('strong').textContent()).includes('1,234'))
    await page.getByLabel('Language').selectOption('en')
    await page.getByRole('heading', { name: 'Document parser example' }).waitFor()
    await page.getByLabel('Metrics').selectOption('unavailable')
    await page.waitForFunction(() => document.querySelector('strong')?.textContent === '—')
    assert.ok((await page.locator('.showcase-metrics').textContent()).includes('Unavailable 1'))
    await page.getByLabel('Metrics').selectOption('stale')
    await page.waitForFunction(() => document.querySelector('.showcase-metrics')?.textContent.includes('Stale 1'))
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    await page.getByRole('link', { name: 'Details' }).last().click()
    await page.waitForURL('**/oss/workspace?lang=en')
    await page.getByRole('heading', { name: 'Product workspace' }).waitFor()
    await page.waitForFunction(() => document.querySelectorAll('.showcase-metrics article').length === 0)
    assert.equal(await page.locator('.showcase-metrics article').count(), 0)
    assert.deepEqual(errors, [])
    await page.close()
  }
  console.log(JSON.stringify({ syntheticShowcase: true, widths: [1280, 390], metricFailureAndAge: true, productLP: true }))
} finally { await browser.close() }
