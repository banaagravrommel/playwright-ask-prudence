import { expect, type Page } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';
import { confirmDestructiveAction } from '../helpers/smoke-cleanup';

export class FormFillTemplatesPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/form-fill-template');
    await this.page.waitForURL(/\/aegis\/form-fill-template/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/form-fill-template/,
      headings: ['Form Fill Templates'],
      buttons: [/Add Template/i],
      columnHeaders: ['Name', 'Type', 'Fields', 'Updated', 'Action']
    });
  }

  async openAddTemplateEditor() {
    await this.page.getByRole('button', { name: /Add Template/i }).click();
    await expect(this.page.getByPlaceholder(/Enter template name/i)).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('button', { name: /Save & Edit/i })).toBeVisible();
  }

  async createTemplate(options: { name: string; type?: 'HTML' | 'PDF' }) {
    await this.openAddTemplateEditor();

    const nameInput = this.page.getByPlaceholder(/Enter template name/i);
    await nameInput.fill(options.name);
    await expect(nameInput).toHaveValue(options.name);

    if (options.type) {
      await this.page.locator('select').first().selectOption({ label: options.type });
    }

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/form-fill-template\/templates\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    await this.page.getByRole('button', { name: /Save & Edit/i }).click();
    await saveResponse;
    await this.expectTemplateEditor(options.name);
  }

  async expectTemplateEditor(name: string) {
    await expect(this.page.getByPlaceholder(/Enter template name/i)).toHaveValue(name);
    await expect(this.page.getByText(/Select a schema to load fields/i)).toBeVisible({ timeout: 15000 });
  }
}

export class FormFillPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/aegis/form-fill');
    await this.page.waitForURL(/\/aegis\/form-fill\/?$/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/aegis\/form-fill\/?$/,
      headings: ['Form Fill Records'],
      buttons: [/New/i],
      columnHeaders: ['Account', 'Resources', 'Template', 'Type', 'Actions']
    });
  }

  async openNewFormFill() {
    await this.page.getByRole('button', { name: /New/i }).first().click();
    await expect(this.page.getByRole('heading', { name: /New Form Fill Record/i })).toBeVisible({
      timeout: 15000
    });
    await expect(this.page.getByPlaceholder(/e.g. Renewal Packet/i)).toBeVisible();
    await expect(this.page.locator('button.btn-primary', { hasText: /^Save$/ })).toBeVisible();
  }

  async selectAccount(searchTerm: string) {
    const accountSearch = this.page.getByPlaceholder(/Search for an account/i);
    await accountSearch.fill(searchTerm);

    await this.page.waitForResponse(
      (response) => /\/accounts\/search/.test(response.url()) && response.status() === 200,
      { timeout: 15000 }
    );

    const option = this.page
      .locator('.vs__dropdown-menu li')
      .filter({ hasText: new RegExp(searchTerm, 'i') })
      .first();
    await expect(option).toBeVisible({ timeout: 15000 });

    const accountName = ((await option.textContent()) ?? '').trim();
    await option.click();
    await expect(this.page.locator('.vs__selected').filter({ hasText: accountName }).first()).toBeVisible();
    return accountName;
  }

  async selectFirstTemplate() {
    const templateSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /Select template/i }) })
      .first();
    const optionLabels = await templateSelect.locator('option').allTextContents();
    const templateLabel = optionLabels
      .map((label) => label.trim())
      .find((label) => label && !/Select template/i.test(label));
    expect(templateLabel, 'expected at least one form fill template').toBeTruthy();

    await templateSelect.selectOption({ label: templateLabel! });

    const templateName = templateLabel!.replace(/\s*\((HTML|PDF)\)\s*$/i, '').trim();
    await expect(this.page.getByRole('heading', { name: /Form Fields/i })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('button', { name: /Refresh Preview/i })).toBeVisible();

    return { templateLabel: templateLabel!, templateName };
  }

  async createFormFillRecord(options: { name: string; accountSearch?: string }) {
    await this.openNewFormFill();

    const nameInput = this.page.getByPlaceholder(/e.g. Renewal Packet/i);
    await nameInput.fill(options.name);
    await expect(nameInput).toHaveValue(options.name);

    const accountName = await this.selectAccount(options.accountSearch ?? 'test');
    const { templateName } = await this.selectFirstTemplate();

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/form-fill\/records\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    await this.page.locator('button.btn-primary', { hasText: /^Save$/ }).click();
    await saveResponse;
    await this.expectRecordVisible({ accountName, templateName });
    await this.expectRecordSavedByName(options.name);

    return { accountName, templateName };
  }

  async expectRecordVisible(options: { accountName: string; templateName: string }) {
    await expect(this.page.getByRole('heading', { name: /Form Fill Records/i })).toBeVisible({
      timeout: 15000
    });
    const row = this.page
      .getByRole('row')
      .filter({ hasText: options.accountName })
      .filter({ hasText: options.templateName })
      .first();
    await expect(row).toBeVisible({ timeout: 15000 });
  }

  private dataRows() {
    return this.page.locator('table tbody tr').filter({ has: this.page.locator('button.btn-outline-danger') });
  }

  async expectRecordSavedByName(recordName: string) {
    const index = await this.findRecordIndexByName(recordName);
    expect(index, `expected form fill record "${recordName}" to be saved`).toBeGreaterThanOrEqual(0);
  }

  private async cancelRecordEditor() {
    await this.page.locator('button.btn-secondary.btn-sm', { hasText: /^Cancel$/i }).click();
    await expect(this.page.getByRole('heading', { name: /Form Fill Records/i })).toBeVisible({
      timeout: 15000
    });
  }

  async findRecordIndexByName(recordName: string) {
    const rows = this.dataRows();
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      await rows.nth(i).locator('button:has(.fa-edit)').click();
      await expect(this.page.getByRole('heading', { name: /Edit Form Fill Record/i })).toBeVisible({
        timeout: 15000
      });

      const currentName = await this.page.getByPlaceholder(/e.g. Renewal Packet/i).inputValue();
      await this.cancelRecordEditor();

      if (currentName === recordName) {
        return i;
      }
    }

    return -1;
  }

  async deleteFormFillRecord(recordName: string) {
    await this.goto();
    await this.expectListPage();

    const rows = this.dataRows();
    const count = await rows.count();

    for (let i = 0; i < count; i++) {
      await rows.nth(i).locator('button:has(.fa-edit)').click();
      await expect(this.page.getByRole('heading', { name: /Edit Form Fill Record/i })).toBeVisible({
        timeout: 15000
      });

      const currentName = await this.page.getByPlaceholder(/e.g. Renewal Packet/i).inputValue();
      await this.cancelRecordEditor();

      if (currentName !== recordName) {
        continue;
      }

      await confirmDestructiveAction(this.page, async () => {
        await this.dataRows().nth(i).locator('button.btn-outline-danger').click();
      });

      await expect(this.dataRows()).toHaveCount(count - 1, { timeout: 15000 });
      return;
    }

    throw new Error(`Form fill record not found for cleanup: ${recordName}`);
  }
}
