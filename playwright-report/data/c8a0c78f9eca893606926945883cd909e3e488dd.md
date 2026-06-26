# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proposal-builder-test.spec.ts >> Proposal Builder - Step 5: Add Resources >> adding a purpose after selecting an account then adding new resources
- Location: tests\proposal-builder-test.spec.ts:67:7

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
  3  | export class ProposalBuilderPage {
  4  |   readonly page: Page;
  5  |   readonly newButton: Locator;
  6  |   readonly addNewAccountButton: Locator;
  7  |   readonly createAccountPanel: Locator;
  8  |   readonly accountNameInput: Locator;
  9  |   readonly createButton: Locator;
  10 |   readonly purposeInput: Locator;
  11 |   readonly accountCombobox: Locator;
  12 | 
  13 |   constructor(page: Page) {
  14 |     this.page = page;
  15 |     this.newButton = page.locator('button:has-text("+ New"), button:has-text("New")').first();
  16 |     this.addNewAccountButton = page.locator('button:has-text("+ Add New Account"), button:has-text("Add New Account")').first();
  17 |     this.createAccountPanel = page.locator('text=Create New Account').first().locator('xpath=ancestor::div[1]');
  18 |     this.accountNameInput = this.createAccountPanel.locator('input').first();
  19 |     this.createButton = this.createAccountPanel.getByRole('button', { name: /create/i }).first();
  20 |     this.purposeInput = page.locator(
  21 |       'textarea[placeholder*="Annual renewal proposal"], input[placeholder*="Annual renewal proposal"], textarea[aria-label*="Purpose"], input[aria-label*="Purpose"]'
  22 |     ).first();
  23 |     this.accountCombobox = page.getByPlaceholder('Select or search account...');
  24 |   }
  25 | 
  26 |   async goto() {
  27 |     await this.page.goto('https://test.getprudens.ai/aegis/proposal-builder', { timeout: 120000 });
  28 |     await this.page.waitForURL(/\/aegis\/proposal-builder/);
> 29 |     await this.page.waitForLoadState('networkidle');
     |                     ^ Error: page.waitForLoadState: Test timeout of 60000ms exceeded.
  30 |   }
  31 | 
  32 |   async openNewProposal() {
  33 |     await expect(this.newButton).toBeVisible();
  34 |     await expect(this.newButton).toBeEnabled();
  35 |     await this.newButton.click();
  36 |   }
  37 | 
  38 |   async addNewAccount(accountName: string) {
  39 |     await expect(this.addNewAccountButton).toBeVisible();
  40 |     await this.addNewAccountButton.click();
  41 |     await expect(this.createAccountPanel).toBeVisible();
  42 |     await expect(this.accountNameInput).toBeVisible();
  43 |     await this.accountNameInput.fill(accountName);
  44 |     await expect(this.accountNameInput).toHaveValue(accountName);
  45 |     await expect(this.createButton).toBeEnabled();
  46 |     await this.createButton.click();
  47 | 
  48 |     const accountCreatedDialog = this.page.locator('text=Account created').first();
  49 |     await expect(accountCreatedDialog).toBeVisible({ timeout: 10000 });
  50 | 
  51 |     const accountCreatedOkButton = this.page.getByRole('button', { name: /OK/ }).first();
  52 |     await expect(accountCreatedOkButton).toBeVisible();
  53 |     await expect(accountCreatedOkButton).toBeEnabled();
  54 |     await accountCreatedOkButton.click();
  55 | 
  56 |     await expect(accountCreatedDialog).toBeHidden();
  57 |     await this.page.waitForLoadState('networkidle');
  58 |   }
  59 | 
  60 |   async fillPurpose(purposeText: string) {
  61 |     await expect(this.purposeInput).toBeVisible();
  62 |     await this.purposeInput.fill(purposeText);
  63 |     await expect(this.purposeInput).toHaveValue(purposeText);
  64 |   }
  65 | 
  66 |   async selectAccount(accountName: string) {
  67 |     await expect(this.accountCombobox).toBeVisible();
  68 |     await this.accountCombobox.click();
  69 |     await this.page.waitForTimeout(500);
  70 | 
  71 |     const accountOption = this.page.locator('[role="option"], [role="listbox"] li, div[role="listbox"] > div').filter({ hasText: accountName }).first();
  72 |     await expect(accountOption).toBeVisible({ timeout: 10000 });
  73 |     await accountOption.click();
  74 |     await this.page.waitForLoadState('networkidle');
  75 |   }
  76 | 
  77 |   async addDocuments(filePaths: string[]) {
  78 |     await this.page.getByRole('button', { name: '+ New' }).click();
  79 |     await this.page.getByText('Document', { exact: true }).click();
  80 |     const fileInput = this.page.locator('input[type="file"]');
  81 |     await fileInput.setInputFiles(filePaths);
  82 |     await expect(this.page.getByText(filePaths[0].split('/').pop() || filePaths[0])).toBeVisible();
  83 |     await this.page.getByRole('button', { name: /Upload/i }).click();
  84 |     await expect(this.page.locator('h3').filter({ hasText: 'Processing Document' })).toBeVisible();
  85 |     await expect(this.page.getByText('Completed', { exact: true })).toBeVisible({ timeout: 60000 });
  86 |     await this.page.getByRole('button', { name: 'Done' }).click();
  87 |     await this.page.waitForLoadState('networkidle');
  88 |   }
  89 | 
  90 |   async generateProposal() {
  91 |     const generateButton = this.page.locator('button:has-text("Generate Proposal"), button:has-text("generate proposal")').first();
  92 |     await expect(generateButton).toBeVisible();
  93 |     await expect(generateButton).toBeEnabled();
  94 |     await generateButton.click();
  95 |     await this.page.waitForLoadState('networkidle');
  96 |   }
  97 | }
  98 | 
```