// tests/loginTests/invalid-credentials.spec.ts
// spec: specs/login-logout.md
// seed: tests/seed.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login & Logout', () => {
  test('Negative — invalid credentials (robust)', async ({ page }) => {
    // 1. Navigate to login page.
    await page.goto('https://www.saucedemo.com/');

    // 2. Ensure fields are visible and fill invalid credentials.
    const username = page.getByPlaceholder('Username');
    const password = page.getByPlaceholder('Password');
    await expect(username).toBeVisible();
    await expect(password).toBeVisible();

    await username.fill('invalid_user');
    await password.fill('incorrect_password');

    // 3. Submit the form.
    await page.click('#login-button');

    // 4. Wait for and assert the specific visible error heading appears.
    // Prefer role-based locator to avoid ambiguous class matches.
    const errorHeading = page.getByRole('heading', {
      level: 3,
      name: /Epic sadface|Username and password|do not match/i,
    });

    // Wait for the error heading to be visible (tolerant to small delays).
    await expect(errorHeading).toBeVisible({ timeout: 5000 });

    // 5. Assert the error text — tolerant to wording changes but specific enough.
    await expect(errorHeading).toContainText(/Epic sadface|Username and password|do not match/i);

    // 6. Assert we did NOT navigate to the protected inventory page.
    await expect(page).not.toHaveURL(/\/inventory\.html/);

    // 7. Assert inventory content is not visible as a defensive check.
    await expect(page.locator('.inventory_list')).not.toBeVisible();

    // 8. Optional defensive checks: ensure no obvious auth tokens were set.
    const cookies = await page.context().cookies();
    const suspiciousCookie = cookies.find(c => /session|auth|token/i.test(c.name));
    expect(suspiciousCookie, 'No auth/session cookies should be set for failed login').toBeUndefined();

    const local = await page.evaluate(() => ({ ...localStorage }));
    const hasAuthKey = Object.keys(local).some(k => /session|auth|token/i.test(k));
    expect(hasAuthKey, 'No auth keys in localStorage after failed login').toBeFalsy();
  });
});