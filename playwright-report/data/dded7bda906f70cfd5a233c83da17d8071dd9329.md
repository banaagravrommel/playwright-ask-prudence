# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proposal-builder-test.spec.ts >> Proposal Builder end-to-end >> creates a draft, adds an account, fills purpose, uploads resources, and generates a proposal
- Location: tests\proposal-builder-test.spec.ts:106:7

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: page.waitForLoadState: Test timeout of 60000ms exceeded.
```

# Test source

```ts
  1  | import { expect, type Locator, type Page } from '@playwright/test';
  2  | 
  3  | export class LoginPage {
  4  |   readonly page: Page;
  5  |   readonly emailInput: Locator;
  6  |   readonly passwordInput: Locator;
  7  |   readonly submitButton: Locator;
  8  |   /** Sidebar nav present as soon as the authenticated shell loads. */
  9  |   readonly authenticatedNavLink: Locator;
  10 | 
  11 |   constructor(page: Page) {
  12 |     this.page = page;
  13 |     this.emailInput = page.locator('input[name="email"], input[type="email"], input[id*=email], input[placeholder*="Email"]');
  14 |     this.passwordInput = page.locator('input[name="password"], input[type="password"], input[id*=password], input[placeholder*="Password"]');
  15 |     this.submitButton = page.getByRole('button', {
  16 |       name: /enter dashboard|sign in|log in|continue/i
  17 |     }).first();
  18 |     this.authenticatedNavLink = page.getByRole('link', { name: /Policy Comparison/i });
  19 |   }
  20 | 
  21 |   async goto() {
  22 |     await this.page.context().clearCookies();
  23 |     await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
  24 |     await expect(this.page).toHaveURL(/\/login/);
  25 |   }
  26 | 
  27 |   async login(email: string, password: string) {
  28 |     if (await this.isLoggedIn()) {
  29 |       return;
  30 |     }
  31 | 
  32 |     await expect(this.emailInput).toBeVisible();
  33 |     await expect(this.passwordInput).toBeVisible();
  34 | 
  35 |     await this.emailInput.fill(email);
  36 |     await this.passwordInput.fill(password);
  37 | 
  38 |     await expect(this.submitButton).toBeEnabled();
  39 |     await this.submitButton.click();
  40 | 
  41 |     await this.expectLoggedIn();
  42 |   }
  43 | 
  44 |   private async isLoggedIn(): Promise<boolean> {
  45 |     return /\/aegis\//.test(this.page.url()) && (await this.authenticatedNavLink.first().isVisible());
  46 |   }
  47 | 
  48 |   private async expectLoggedIn() {
  49 |     await expect(this.page).toHaveURL(/\/aegis\//, { timeout: 30000 });
> 50 |     await this.page.waitForLoadState('networkidle');
     |                     ^ Error: page.waitForLoadState: Test timeout of 60000ms exceeded.
  51 |     await expect(this.authenticatedNavLink.first()).toBeVisible({ timeout: 60000 });
  52 |   }
  53 | }
  54 | 
```