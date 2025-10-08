// spec: specs/login-logout.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login & Logout', () => {
  test('Happy path — successful login', async ({ page }) => {
    // 1. Navigate to https://www.saucedemo.com/.
    await page.goto('https://www.saucedemo.com/');

    // 2. Verify page loaded and username, password, login button are visible.
    await expect(page.locator('#user-name')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
    await expect(page.locator('#login-button')).toBeVisible();

    // 3. Fill #user-name with standard_user.
    await page.fill('#user-name', 'standard_user');

    // 4. Fill #password with secret_sauce.
    await page.fill('#password', 'secret_sauce');

    // 5. Click #login-button (or press Enter).
    await page.click('#login-button');

    // 6. Wait for navigation to complete and assert inventory is visible.
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    // assert product list or at least one inventory item is visible
    await expect(page.locator('.inventory_list')).toBeVisible();
    await expect(page.locator('.inventory_item').first()).toBeVisible();
  });
});
