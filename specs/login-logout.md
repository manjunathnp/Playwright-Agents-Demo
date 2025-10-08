# SauceDemo — Login & Logout Test Plan

## Executive summary
This document defines a comprehensive manual and automation-ready test plan for login and logout functionality on https://www.saucedemo.com/. It covers happy paths, negative tests, edge cases, session/security checks, and accessibility/UX checks. Each scenario assumes a fresh browser state unless otherwise noted.

Reference: repository currently contains `tests/seed.spec.ts` which opens the home page. This plan is intended to be implemented with Playwright (existing project), but steps are written so any tester can follow them.

---

## Test data (recommended)
- Valid credentials
  - Username: `standard_user`
  - Password: `secret_sauce`
- Locked out user
  - Username: `locked_out_user`
  - Password: `secret_sauce`
- Other demo users (for exploratory tests)
  - `problem_user` / `secret_sauce`
  - `performance_glitch_user` / `secret_sauce`
- Invalid credentials
  - `invalid_user` / `incorrect_password`
- Injection attempts
  - Username: `admin' OR '1'='1`
  - Password: `password' OR '1'='1`

Note: These usernames/passwords are public demo credentials commonly used on Sauce Demo. Confirm against the site before automation.

---

## Environment & assumptions
- Tests are executed from a fresh browser profile (no cookies, localStorage, or sessionStorage).
- Base URL: `https://www.saucedemo.com/`
- Login page elements (verify selectors before implementation):
  - Username input: `#user-name`
  - Password input: `#password`
  - Login button: `#login-button`
- Successful login landing (inventory page):
  - URL expected: `https://www.saucedemo.com/inventory.html`
  - Primary element: `.inventory_list` or `.inventory_item`
- Logout controls:
  - Menu button: `#react-burger-menu-btn`
  - Logout link: `#logout_sidebar_link`
- Tests must be independent and idempotent (leave no persistent state).
- All scenarios assume network connectivity to the public site and default site behavior.

---

## Test scenario structure (applies to each scenario)
- Title
- Assumptions / Starting state (always: fresh browser, cleared storage)
- Steps (numbered, actionable)
- Expected results / assertions (explicit)
- Success criteria & failure conditions

---

## Scenarios

### 1. Happy path — successful login
Assumptions:
- Fresh browser session.
- Valid credentials (`standard_user`/`secret_sauce`) available.

Steps:
1. Navigate to `https://www.saucedemo.com/`.
2. Verify page loaded and username, password, login button are visible.
3. Fill `#user-name` with `standard_user`.
4. Fill `#password` with `secret_sauce`.
5. Click `#login-button` (or press Enter).
6. Wait for navigation to complete.

Expected results:
- URL becomes `https://www.saucedemo.com/inventory.html`.
- `.inventory_list` or `.inventory_item` elements are visible (product list rendered).
- No login error message shown.
- Page title or header indicates "Products" (if present).

Success criteria:
- User is on inventory page and product items are listed.

Failure conditions:
- Remains on login page, or visible error message, or inventory not visible.

---

### 2. Happy path — logout from inventory page
Assumptions:
- User is already logged in (complete Scenario 1 or start with logged-in state).

Steps:
1. From inventory page, click `#react-burger-menu-btn` (menu).
2. Wait for sidebar/menu to open.
3. Click `#logout_sidebar_link`.
4. Wait for navigation to complete.

Expected results:
- Browser navigates back to `https://www.saucedemo.com/` (login page).
- Username, password, login button visible.
- Attempting to use browser "Back" should not re-authenticate (see scenario 6).

Success criteria:
- Logout returns user to login page and prevents access to inventory without re-login.

Failure conditions:
- User remains authenticated after logout, or inventory still accessible without login.

---

### 3. Negative — invalid credentials
Assumptions:
- Fresh browser session.

Steps:
1. Go to `https://www.saucedemo.com/`.
2. Enter `invalid_user` in `#user-name`.
3. Enter `incorrect_password` in `#password`.
4. Click `#login-button`.

Expected results:
- User remains on login page.
- Error message appears (e.g., "Epic sadface: Username and password do not match any user in this service").
- No redirect to inventory page.
- No cookies/localStorage tokens for authenticated session set.

Success criteria:
- Login attempt is rejected and error message matches expected text (if exact message required).

Failure conditions:
- Unexpected redirect to inventory, or no visible error message.

---

### 4. Locked out user behavior
Assumptions:
- Fresh session.
- Use `locked_out_user` / `secret_sauce`.

Steps:
1. Navigate to login page.
2. Enter `locked_out_user` and `secret_sauce`.
3. Click login.

Expected results:
- Login is rejected.
- Error message indicates locked-out status (verify message wording).
- No redirection to inventory.

Success criteria:
- Proper locked-out message displayed and account cannot access inventory.

Failure conditions:
- Locked-out user is allowed to log in.

---

### 5. Validation — empty fields
Assumptions:
- Fresh session.

Steps:
1. Navigate to login page.
2. Leave `#user-name` and/or `#password` empty.
3. Click `#login-button`.

Expected results:
- Error or inline validation prevents login (site shows an error message).
- No redirect to inventory.

Success criteria:
- Login with empty username/password is rejected.

Failure conditions:
- If empty submission is allowed (unexpected), report as severe bug.

---

### 6. Session and navigation security (post-logout access)
Assumptions:
- Start from logged-in user (complete Scenario 1), then perform logout.

Steps:
1. Login (Scenario 1).
2. Navigate to inventory and verify content.
3. Click menu -> logout (Scenario 2).
4. After landing on login page, press the browser Back button once.
5. Attempt to directly open `https://www.saucedemo.com/inventory.html` in the same browser window.
6. Optionally: check cookies, sessionStorage, localStorage for authentication tokens.

Expected results:
- After logout, pressing Back should not show protected inventory content (site should redirect to login or show unauthenticated state).
- Direct navigation to `/inventory.html` should require login and should redirect to login page.
- No persistent auth state (cookies/storage) that restores session automatically.

Success criteria:
- Inventory is inaccessible after logout via back-button or direct URL.

Failure conditions:
- Inventory remains visible without re-login, or auth tokens persist.

---

### 7. UI/UX checks on login and logout
Assumptions:
- Fresh session.

Steps / Checks:
1. Verify focus is in username field on page load (accessibility).
2. Verify pressing Enter after typing password triggers login.
3. Verify error messages are announced for screen readers (if ARIA attributes present).
4. Verify menu and logout controls are reachable by keyboard (tab navigation).

Expected results:
- Accessibility and keyboard interactions function as expected.

Success criteria:
- Keyboard flows work and visible UI changes are accessible.

Failure conditions:
- Missing focus, keyboard controls inaccessible.

---

### 8. Edge case — SQL/command injection in inputs
Assumptions:
- Fresh session.

Steps:
1. Enter injection-like strings into username and/or password.
2. Click login.

Expected results:
- Login is rejected (unless credentials match).
- No sensitive site errors, stack traces, or database error messages are shown.
- Input is treated as plain text/sanitized.

Success criteria:
- Site properly handles unexpected input with no sensitive info leaked.

Failure conditions:
- Visible stack traces, database errors, or successful bypass.

---

### 9. Rate limiting / brute force observation (light check)
Assumptions:
- Non-production testing; avoid abusive rapid attempts.

Steps:
1. Perform 5 rapid failed login attempts with invalid credentials.
2. Observe any throttling, delays, or CAPTCHA behavior.

Expected results:
- Either consistent rejection messages or explicit throttling/CAPTCHA if implemented.
- No account locking unless specified.

Success criteria:
- Site handles rapid failed attempts without exposing errors or bypasses.

Failure conditions:
- Unexpected server errors or inconsistent behavior.

---

## Cross-scenario checks and metadata
- Smoke test: run scenarios 1 and 2 sequentially to validate core flows.
- Regression targets: ensure inventory elements (product list) remain present after login.
- Test independence: each scenario must reset to fresh session or explicitly log out.

## Expected element selectors (verify before automating)
- `#user-name` — username input
- `#password` — password input
- `#login-button` — login button
- `.error-message-container` — possible error container (site-dependent)
- `#react-burger-menu-btn` — menu (open)
- `#logout_sidebar_link` — logout entry
- `https://www.saucedemo.com/inventory.html` — inventory page URL

## Automation notes (Playwright)
- Use fixtures to ensure fresh context for each test (`context = await browser.newContext()`).
- Wait for navigation with `await page.waitForURL('/inventory.html')` or `await page.waitForSelector('.inventory_list')`.
- Verify the absence of tokens: `await context.cookies()` and `await page.evaluate(() => localStorage)` as checks.
- For accessibility checks, consider `axe-playwright` or Playwright's built-in `accessibility.snapshot()`.

## Test implementation priority
1. Scenario 1 (Happy login)
2. Scenario 2 (Logout)
3. Scenario 3 (Invalid credentials)
4. Scenario 4 (Locked out user)
5. Scenario 6 (Session/navigation security)
6. Scenario 5 (Empty validation)
7. Scenario 8 (Injection checks)
8. Scenario 7 (Accessibility/keyboard)
9. Scenario 9 (Rate limiting — manual / light automation)

## Reporting & acceptance
- Each test result must include:
  - Steps performed (copy of executed test steps)
  - Environment (browser version, OS)
  - Pass/Fail and screenshots for failures
  - Console logs and network traces for failures where relevant

---

## Appendix — Quick manual smoke test (one-liner checklist)
1. Open `https://www.saucedemo.com/`.
2. Login with `standard_user` / `secret_sauce`.
3. Confirm inventory page appears.
4. Open menu and logout.
5. Confirm return to login and inventory inaccessible.

