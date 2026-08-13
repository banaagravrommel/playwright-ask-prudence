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
    this.emailInput = page.getByRole('textbox', { name: /email/i });
    this.passwordInput = page.getByRole('textbox', { name: /password/i });
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
    await Promise.all([
      this.page.waitForURL(/\/aegis\//, { timeout: 60000, waitUntil: 'commit' }),
      this.submitButton.click()
    ]);

    await this.expectLoggedIn();
  }

  private async isLoggedIn(): Promise<boolean> {
    return /\/aegis\//.test(this.page.url()) && (await this.authenticatedNavLink.first().isVisible().catch(() => false));
  }

  private async expectLoggedIn() {
    await expect(this.page).toHaveURL(/\/aegis\//, { timeout: 60000 });
    // Layout Options drawer can obscure the app sidebar after login; close it if present.
    const closeNav = this.page.getByRole('button', { name: /Close navigation/i });
    if (await closeNav.isVisible().catch(() => false)) {
      await closeNav.click();
    }
    // Prefer sidebar nav when it hydrates; URL under /aegis/ is enough for a valid session cookie.
    const nav = this.authenticatedNavLink.first();
    if (await nav.isVisible({ timeout: 15000 }).catch(() => false)) {
      return;
    }
  }
}
