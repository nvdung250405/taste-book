import { test, expect } from '@playwright/test'
import { setupFixtureApi } from './fixtures.mjs'

for (const path of [
  '/',
  '/search',
  '/recipe/1',
  '/login',
  '/register',
  '/recipe/create',
  '/menu?tab=my-menus',
  '/shopping-list',
  '/profile',
  '/admin',
  '/admin/recipes',
  '/admin/approvals',
  '/admin/categories',
  '/admin/ingredients',
  '/admin/units',
  '/admin/users',
]) {
  test(`layout and runtime ${path}`, async ({ page }, testInfo) => {
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    const authenticated = ![
      '/login',
      '/register',
      '/',
      '/search',
      '/recipe/1',
    ].includes(path)
    await setupFixtureApi(
      page,
      path.startsWith('/admin') ? 'Admin' : 'User',
      authenticated,
    )
    await page.goto(path, { waitUntil: 'networkidle' })
    await expect(page.locator('h1').first()).toBeVisible()
    const width = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: document.documentElement.clientWidth,
    }))
    expect(width.document).toBeLessThanOrEqual(width.viewport + 1)
    expect(errors).toEqual([])
    await expect(page.locator('body')).not.toHaveText(
      /TypeError|ReferenceError|Something went wrong/,
    )
    if (
      ['/', '/search', '/menu?tab=my-menus', '/admin/recipes'].includes(path)
    ) {
      await testInfo.attach('layout', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      })
    }
  })
}

test('mobile navigation can be opened after its chunk loads', async ({
  page,
}, testInfo) => {
  test.skip(!testInfo.project.name.endsWith('mobile'), 'Mobile navigation only')
  await setupFixtureApi(page)
  await page.goto('/')
  await page.getByRole('button', { name: 'Mở menu điều hướng' }).click()
  const sheet = page.getByRole('dialog')
  await expect(sheet).toBeVisible()
  await sheet.getByRole('link', { name: 'Khám phá', exact: true }).click()
  await expect(page).toHaveURL(/\/search/)
  await expect(sheet).not.toBeVisible()
})

test('production transport serves Brotli and Gzip and keeps SPA deep links', async ({
  request,
}) => {
  const html = await request.get('/', { headers: { 'Accept-Encoding': 'br' } })
  expect(html.headers()['content-encoding']).toBe('br')
  const source = await html.text()
  const script = source.match(/<script[^>]+src="([^"]+)"/)[1]
  const javascript = await request.get(script, {
    headers: { 'Accept-Encoding': 'gzip' },
  })
  expect(javascript.headers()['content-encoding']).toBe('gzip')
  expect(javascript.headers()['content-type']).toContain('javascript')
  expect(javascript.headers()['cache-control']).toContain('immutable')
  expect(
    (
      await request.get('/search', { headers: { Accept: 'text/html' } })
    ).status(),
  ).toBe(200)
  expect((await request.get('/missing.js')).status()).toBe(404)
})
