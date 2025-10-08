import { test, expect } from '@playwright/test';

test.describe('Test group', () => {
  test('seed: open home page', async ({ page }) => {
      await page.goto('https://www.saucedemo.com/');

      await test.expect(page).toHaveURL('https://www.saucedemo.com/');
  });
});
