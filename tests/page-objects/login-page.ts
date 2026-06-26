import { expect, type Locator, type Page } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  /** Sidebar nav present as soon as the authenticated shell loads. */
  readonly authenticatedNavLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[name="email"], input[type="email"], input[id*=email], input[placeholder*="Email"]');
    this.passwordInput = page.locator('input[name="password"], input[type="password"], input[id*=password], input[placeholder*="Password"]');
    this.submitButton = page.getByRole('button', {
      name: /enter dashboard|sign in|log in|continue/i
    }).first();
    this.authenticatedNavLink = page.getByRole('link', { name: /Policy Comparison/i });
  }

  async goto() {
    await this.page.context().clearCookies();
    await this.page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(this.page).toHaveURL(/\/login/);
  }

  async login(email: string, password: string) {
    if (await this.isLoggedIn()) {
      return;
    }

    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();

    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    await expect(this.submitButton).toBeEnabled();
    await this.submitButton.click();

    await this.expectLoggedIn();
  }

  private async isLoggedIn(): Promise<boolean> {
    return /\/aegis\//.test(this.page.url()) && (await this.authenticatedNavLink.first().isVisible());
  }

  private async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/aegis\//, { timeout: 30000 });
    await this.page.waitForLoadState('networkidle');
    await expect(this.authenticatedNavLink.first()).toBeVisible({ timeout: 60000 });
  }
}
