import { test, expect } from '@playwright/test'
import { createRequire } from 'node:module'
import { setupFixtureApi } from './fixtures.mjs'

const require = createRequire(import.meta.url)
const paths = [
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
]

for (const path of paths) {
  test(`accessibility ${path}`, async ({ page }, testInfo) => {
    const publicPaths = ['/', '/search', '/recipe/1', '/login', '/register']
    await setupFixtureApi(
      page,
      path.startsWith('/admin') ? 'Admin' : 'User',
      !publicPaths.includes(path),
    )
    await page.goto(path, { waitUntil: 'networkidle' })
    await expect(page.locator('h1').first()).toBeVisible()
    await page.addScriptTag({ path: require.resolve('axe-core/axe.min.js') })
    const result = await page.evaluate(async () =>
      window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21aa'] },
      }),
    )
    await testInfo.attach('accessibility', {
      body: JSON.stringify(result.violations, null, 2),
      contentType: 'application/json',
    })
    expect(
      result.violations.map(({ id, nodes }) => ({
        id,
        nodes: nodes.map(({ target, failureSummary }) => ({
          target,
          failureSummary,
        })),
      })),
    ).toEqual([])
  })
}

test('popular search works with the keyboard', async ({ page }) => {
  await setupFixtureApi(page)
  await page.goto('/', { waitUntil: 'networkidle' })
  const shortcut = page.getByRole('button', { name: 'Salad', exact: true })
  await shortcut.focus()
  await page.keyboard.press('Enter')
  await expect(page).toHaveURL(/\/search\?search=Salad$/)
})
