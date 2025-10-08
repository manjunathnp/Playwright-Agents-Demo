# Playwright Agents Demo Project

This project shows how to make browser tests using **Playwright** plus **Agents** (Planner, Generator, Healer).  
---

## What is this project?

- **Playwright** is a tool to control a browser (click, type, check) for testing web apps.  
- **Agents** are helpers that make writing tests easier:
  - **Planner** writes a test plan in plain text (Markdown).  
  - **Generator** turns the plan into real code tests.  
  - **Healer** watches failing tests and suggests improvements or fixes.

This project uses those tools to test the site **https://www.saucedemo.com**.

---

## What can it do?

- Automatically make test plans from instructions.  
- Automatically build test code from those plans.  
- Detect broken tests and suggest fixes (e.g. selector updates).  
- Support expansion to many kinds of workflows (not just login/logout).

---

## How to use it — step by step

These steps assume you already have Node.js, VS Code, and a fresh project with Playwright installed.

### 1. Setup agents

In your project folder, run:

```bash
npx playwright init-agents --loop=vscode
````

This sets up folders and config so agents work.

### 2. Create a seed test

Make a file `tests/seed.spec.ts` with:

```ts
import { test, expect } from '@playwright/test';

test('seed: open homepage', async ({ page }) => {
  await page.goto('https://www.saucedemo.com/');
  await expect(page).toHaveURL('https://www.saucedemo.com/');
});
```

This “seed” helps Planner know where to start.

### 3. Ask the Planner to make a test plan

In VS Code’s Agent Chat or Planner panel, write a prompt like:

> “Make a Markdown plan for login → logout on saucedemo.com, using `tests/seed.spec.ts` as starting point.”

Planner will create a file in `specs/`, e.g. `specs/login-logout.md`.

### 4. Ask the Generator to make tests

In VS Code Agent Chat or Generator panel, write:

> “Take `specs/login-logout.md` and make a Playwright test file in `tests/`.”

It will generate `tests/login-logout.spec.ts` (or similar) with real test code.

### 5. Run your tests

In terminal:

```bash
npx playwright test
```

* If tests pass, great!
* If any test fails (e.g. a selector broke), the **Healer** agent will:

  1. Find the problem.
  2. Suggest a fix (update selector, add wait, etc.).
  3. Ask you to accept the patch.
  4. Re-run test after applying patch.

### 6. Add new workflows as you grow

To test a new feature (like “add to cart”, “search”, etc.), repeat:

1. Use Planner to write a new `.md` plan.
2. Use Generator to convert plan into test code.
3. Run and heal as needed.

---

## Project structure

```
root/
  .github/            ← agent configs
  specs/              ← Markdown plans for workflows
    login-logout.md
    checkout.md
    ...
  tests/              ← test code (generated + refined)
    seed.spec.ts
    login-logout.spec.ts
    ...
  playwright.config.ts
  package.json
  README.md           ← this file
```

---

## Tips & advice

* Keep the seed test simple — don’t add too many steps there.
* Always review the `.md` plan and `.ts` test — agents help, you own them.
* Use version control (Git) — commit plans and tests so you track changes.
* After upgrading Playwright, run `npx playwright init-agents` again to refresh agent setup.
* Use Playwright’s trace viewer and HTML report to inspect test runs step by step.

---

## Getting started (for new contributors)

1. Clone this repo.
2. Run `npm install` and `npx playwright install`.
3. Open in VS Code (ensure agent UI works).
4. Run `npx playwright test` to see tests run.
5. To add a new workflow (ex: “search product”), ask Planner and Generator to generate it, then run & heal.