import { test, expect } from '@playwright/test'
import { setupFixtureApi } from './fixtures.mjs'

for (const role of ['User', 'Admin']) {
  for (const failed of [false, true]) {
    test(`logout returns ${role} home when API ${failed ? 'fails' : 'succeeds'}`, async ({ page }, testInfo) => {
      await setupFixtureApi(page, role, true)
      await page.route('**/api/v1/auth/logout', route => route.fulfill({
        status: failed ? 500 : 200,
        contentType: 'application/json',
        body: JSON.stringify({ EC: failed ? 1 : 0 }),
      }))
      await page.goto(role === 'Admin' ? '/admin' : '/profile', { waitUntil: 'networkidle' })
      const mobile = testInfo.project.use.viewport.width < 1024
      if (mobile) {
        await page.getByRole('button', { name: role === 'Admin' ? 'Mở menu quản trị' : 'Mở menu điều hướng', exact: true }).click()
      } else if (role === 'User') {
        await page.getByRole('button', { name: 'Mở menu tài khoản', exact: true }).click()
      }
      await page.getByRole('button', { name: 'Đăng xuất', exact: true }).click()
      await expect(page).toHaveURL(/\/$/)
      await expect(page.locator('h1')).toContainText('Hôm nay bạn muốn')
      expect(await page.evaluate(() => localStorage.getItem('token'))).toBeNull()
    })
  }
}
