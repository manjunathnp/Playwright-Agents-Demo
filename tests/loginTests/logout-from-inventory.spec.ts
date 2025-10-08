// spec: specs/login-logout.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login & Logout', () => {
  test('Happy path — logout from inventory page', async ({ page }) => {
    // Precondition (login) - follow login steps
    // 1. Navigate to https://www.saucedemo.com/.
    await page.goto('https://www.saucedemo.com/');

    // 2. Fill username and password
    await expect(page.locator('#user-name')).toBeVisible();
    await page.fill('#user-name', 'standard_user');
    await expect(page.locator('#password')).toBeVisible();
    await page.fill('#password', 'secret_sauce');

    // 3. Click login button and wait for inventory
    await page.click('#login-button');
    await expect(page).toHaveURL('https://www.saucedemo.com/inventory.html');
    await expect(page.locator('.inventory_list')).toBeVisible();

    // Steps for logout
    // 1. From inventory page, click #react-burger-menu-btn (menu).
    await page.click('#react-burger-menu-btn');

    // 2. Wait for sidebar/menu to open and click #logout_sidebar_link.
    await expect(page.locator('#logout_sidebar_link')).toBeVisible();
    await page.click('#logout_sidebar_link');

    // 3. Wait for navigation to complete and verify we're back on login page.
    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(page.locator('#login-button')).toBeVisible();
    await expect(page.locator('#user-name')).toBeVisible();

    // Additional post-logout check: attempt direct access to inventory should redirect to login
    await page.goto('https://www.saucedemo.com/inventory.html');
    // site should require login (either redirect to login or show login elements)
    await expect(page.locator('#login-button')).toBeVisible();
    // ensure we're not on inventory page
    await expect(page).not.toHaveURL('https://www.saucedemo.com/inventory.html');
  });
});
