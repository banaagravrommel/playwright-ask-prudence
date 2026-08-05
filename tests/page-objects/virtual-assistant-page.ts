import { expect, type Locator, type Page } from '@playwright/test';
import { expectPageBaseline } from '../helpers/page-baseline';
import { confirmDestructiveAction, deleteRowByName } from '../helpers/smoke-cleanup';

export class VirtualAssistantPage {
  readonly page: Page;
  readonly newAssistantButton: Locator;
  readonly assistantsTable: Locator;
  readonly askPrudensLink: Locator;
  readonly sopsTab: Locator;
  readonly observersTab: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newAssistantButton = page.getByRole('button', { name: '+ New Assistant' });
    this.assistantsTable = page.getByRole('table').first();
    this.askPrudensLink = page.getByRole('link', { name: /Ask Prudens/i });
    this.sopsTab = page.getByRole('link', { name: /SOPs/i });
    this.observersTab = page.getByRole('link', { name: /Observers/i });
  }

  async goto() {
    await this.page.goto('/virtual-assistant');
    await this.page.waitForURL(/\/virtual-assistant\/?$/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectListPage() {
    await expectPageBaseline(this.page, {
      url: /\/virtual-assistant\/?$/,
      visibleText: [/Virtual Assistants/i, /Manage your AI Virtual Assistants/i],
      headings: ['Assistants'],
      buttons: [/New Assistant/i],
      columnHeaders: ['Assistant', 'Personality', 'Contact', 'Capabilities', 'Status', 'Actions']
    });
    await expect(this.assistantsTable).toBeVisible();
  }

  async openNewAssistantEditor() {
    await expect(this.newAssistantButton).toBeEnabled();
    await this.newAssistantButton.click();
    await expect(this.page.getByRole('button', { name: /Save Assistant/i })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('tab', { name: 'Details' })).toBeVisible();
    await expect(this.page.getByRole('textbox', { name: /Enter assistant name/i })).toBeVisible();
  }

  async createAssistant(options: { name: string; overview?: string }) {
    await this.openNewAssistantEditor();

    const nameInput = this.page.getByRole('textbox', { name: /Enter assistant name/i });
    await nameInput.fill(options.name);
    await expect(nameInput).toHaveValue(options.name);

    const overview = options.overview ?? 'Smoke test assistant created by Playwright.';
    const overviewInput = this.page.getByPlaceholder(/Describe what this assistant does/i);
    if (await overviewInput.isVisible().catch(() => false)) {
      await overviewInput.fill(overview);
    }

    const saveResponsePromise = this.page.waitForResponse(
      (response) =>
        /\/virtual-assistant\/assistants\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    const saveButton = this.page.getByRole('button', { name: /Save Assistant/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    const saveResponse = await saveResponsePromise;

    let assistantId: string | number | undefined;
    try {
      const body = await saveResponse.json();
      assistantId = body?.assistant?.id ?? body?.id ?? body?.data?.id ?? body?.assistant_id;
    } catch {
      assistantId = undefined;
    }

    await expect(this.page.getByRole('textbox', { name: /Enter assistant name/i })).toHaveValue(options.name, {
      timeout: 15000
    });

    return { assistantId };
  }

  async expectAssistantInList(name: string) {
    await this.goto();
    await this.expectListPage();
    await expect(this.page.getByRole('row').filter({ hasText: name }).first()).toBeVisible({ timeout: 15000 });
  }

  /**
   * Assistants expose View/Edit only — no Delete UI, and DELETE /assistants/:id returns 405.
   * Teardown deactivates via Save PUT (status=inactive), the supported cleanup path.
   */
  async deleteAssistant(options: { name: string; assistantId?: string | number }) {
    await this.goto();
    await this.expectListPage();

    const row = this.page.getByRole('row').filter({ hasText: options.name }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.locator('button:has(.fa-edit), button.btn-outline-secondary').click();
    await expect(this.page.getByRole('textbox', { name: /Enter assistant name/i })).toHaveValue(options.name, {
      timeout: 15000
    });

    const assistantId = options.assistantId;
    const routePattern = assistantId
      ? `**/virtual-assistant/assistants/${assistantId}`
      : '**/virtual-assistant/assistants/**';

    await this.page.route(routePattern, async (route) => {
      if (route.request().method() === 'PUT') {
        const data = JSON.parse(route.request().postData() || '{}');
        data.status = 'inactive';
        await route.continue({ postData: JSON.stringify(data) });
        return;
      }
      await route.continue();
    });

    try {
      const overviewInput = this.page.getByPlaceholder(/Describe what this assistant does/i);
      if (await overviewInput.isVisible().catch(() => false)) {
        await overviewInput.fill('Deactivated by Playwright smoke cleanup.');
      }

      const saveResponse = this.page.waitForResponse(
        (response) =>
          /\/virtual-assistant\/assistants\//.test(response.url()) &&
          response.request().method() === 'PUT' &&
          response.status() === 200,
        { timeout: 30000 }
      );

      await this.page.getByRole('button', { name: /Save Assistant/i }).click();
      await saveResponse;
    } finally {
      await this.page.unroute(routePattern);
    }

    await this.goto();
    await this.expectListPage();
    const deactivatedRow = this.page.getByRole('row').filter({ hasText: options.name }).first();
    await expect(deactivatedRow).toBeVisible({ timeout: 15000 });
    await expect(deactivatedRow).toContainText(/INACTIVE/i);
  }

  async goToAskPrudens() {
    await this.askPrudensLink.first().click();
    await expect(this.page).toHaveURL(/\/virtual-assistant\/ask-prudens/);
  }

  async goToObservers() {
    await this.observersTab.click();
    await expect(this.page).toHaveURL(/\/virtual-assistant-observers/);
  }

  async goToSops() {
    await this.sopsTab.first().click();
  }

  async expectSopsPage() {
    await expect(this.page.getByRole('heading', { name: 'Company SOPs' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Add SOP/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Title' })).toBeVisible();
  }

  async openAddSopEditor() {
    await this.page.getByRole('button', { name: /Add SOP/i }).click();
    await expect(this.page.getByRole('heading', { name: 'New SOP' })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: 'Steps' })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: 'Flow' })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Lead Qualification Process/i)).toBeVisible();
  }

  async openSopFlowTab() {
    const flowTab = this.page.getByRole('tab', { name: 'Flow' });
    await expect(flowTab).toBeVisible();
    await flowTab.click();
    await expect(this.page.locator('.sop-flow-canvas-container')).toBeVisible({ timeout: 15000 });
  }

  /** Shell-only: flow canvas + node palette. Does not build a multi-node workflow. */
  async expectSopFlowCanvasShell() {
    const canvas = this.page.locator('.sop-flow-canvas-container');
    await expect(canvas).toBeVisible();

    const palette = this.page.locator('.node-palette.sop-node-palette, .sop-node-palette');
    await expect(palette).toBeVisible();
    for (const node of ['Start', 'SOP', 'Transfer', 'End'] as const) {
      await expect(palette.locator('.palette-node-label', { hasText: node })).toBeVisible();
    }

    await expect(this.page.getByRole('heading', { name: /Flow Connections/i })).toBeVisible();
  }

  async createSop(options: { title: string; description: string; steps: string }) {
    await this.page.getByPlaceholder(/Lead Qualification Process/i).fill(options.title);
    await this.page.getByPlaceholder(/Brief description of this SOP/i).fill(options.description);
    await this.page.getByPlaceholder(/Enter step-by-step procedure/i).fill(options.steps);

    const saveButton = this.page.getByRole('button', { name: /Save SOP/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(this.page.getByRole('heading', { name: 'Company SOPs' })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('row').filter({ hasText: options.title }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteSop(title: string) {
    await this.goto();
    await this.goToSops();
    await this.expectSopsPage();
    await deleteRowByName(this.page, title, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
  }

  async openFirstActiveAssistant() {
    const row = this.page.getByRole('row').filter({ hasText: /active/i }).first();
    await row.click();
    await expect(this.page.getByRole('button', { name: /Save Assistant/i })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('textbox', { name: /Enter assistant name/i })).toBeVisible();
  }

  async openAssistantEditor(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    await row.locator('button:has(.fa-edit), button.btn-outline-secondary').click();
    await expect(this.page.getByRole('textbox', { name: /Enter assistant name/i })).toHaveValue(name, {
      timeout: 15000
    });
    await expect(this.page.getByRole('button', { name: /Save Assistant/i })).toBeVisible();
  }

  async openPersonalityTab() {
    await this.page.getByRole('tab', { name: 'Personality' }).click();
    await expect(this.page.getByText(/Personality Type/i).first()).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByText(/Personality Description/i).first()).toBeVisible();
  }

  async openGreetingsTab() {
    await this.page.getByRole('tab', { name: 'Greetings' }).click();
    await expect(this.page.getByText(/Default Greeting/i).first()).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByPlaceholder(/Used when no channel-specific greeting is set/i)).toBeVisible();
  }

  async fillPersonality(options: { type: string; description?: string }) {
    await this.openPersonalityTab();
    const typeSelect = this.page.locator('select').filter({ has: this.page.locator('option', { hasText: 'Professional' }) }).first();
    await typeSelect.selectOption({ label: options.type });
    await expect(typeSelect).toHaveValue(options.type);

    if (options.description !== undefined) {
      const description = this.page
        .locator('label', { hasText: /Personality Description/i })
        .locator('xpath=following::textarea[1]');
      await description.fill(options.description);
      await expect(description).toHaveValue(options.description);
    }
  }

  async fillGreetings(options: { defaultGreeting?: string; chatGreeting?: string }) {
    await this.openGreetingsTab();

    if (options.defaultGreeting !== undefined) {
      const defaultGreeting = this.page.getByPlaceholder(/Used when no channel-specific greeting is set/i);
      await defaultGreeting.fill(options.defaultGreeting);
      await expect(defaultGreeting).toHaveValue(options.defaultGreeting);
    }

    if (options.chatGreeting !== undefined) {
      const chatGreeting = this.page.getByPlaceholder(/Greeting script for web\/chat conversations/i);
      await chatGreeting.fill(options.chatGreeting);
      await expect(chatGreeting).toHaveValue(options.chatGreeting);
    }
  }

  async saveAssistant() {
    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/virtual-assistant\/assistants\//.test(response.url()) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      { timeout: 30000 }
    );

    const saveButton = this.page.getByRole('button', { name: /Save Assistant/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await saveResponse;
  }

  async expectPersonality(options: { type: string; description?: string }) {
    await this.openPersonalityTab();
    const typeSelect = this.page.locator('select').filter({ has: this.page.locator('option', { hasText: 'Professional' }) }).first();
    await expect(typeSelect).toHaveValue(options.type);

    if (options.description !== undefined) {
      const description = this.page
        .locator('label', { hasText: /Personality Description/i })
        .locator('xpath=following::textarea[1]');
      await expect(description).toHaveValue(options.description);
    }
  }

  async expectGreetings(options: { defaultGreeting?: string; chatGreeting?: string }) {
    await this.openGreetingsTab();

    if (options.defaultGreeting !== undefined) {
      await expect(this.page.getByPlaceholder(/Used when no channel-specific greeting is set/i)).toHaveValue(
        options.defaultGreeting
      );
    }

    if (options.chatGreeting !== undefined) {
      await expect(this.page.getByPlaceholder(/Greeting script for web\/chat conversations/i)).toHaveValue(
        options.chatGreeting
      );
    }
  }

  async openActivitiesTab() {
    await this.page.getByRole('tab', { name: 'Activities' }).click();
    await expect(this.page.getByRole('heading', { name: 'Activities', exact: true })).toBeVisible({
      timeout: 15000
    });
    await expect(this.page.getByRole('button', { name: /Add Activity/i })).toBeVisible();
    await expect(
      this.page.getByRole('columnheader', { name: 'Channel' }).or(this.page.getByRole('heading', { name: /No Activities Configured/i }))
    ).toBeVisible();
  }

  async openAddActivityEditor() {
    await this.page.getByRole('button', { name: /Add Activity/i }).click();
    await expect(this.page.getByRole('heading', { name: 'New Activity' })).toBeVisible();
    await expect(this.page.getByRole('textbox', { name: /Handle Inbound Emails/i })).toBeVisible();
    await expect(this.page.getByText(/Channel Type/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Activity/i })).toBeVisible();
  }

  async createActivity(options: {
    name: string;
    channel?: string;
    sop?: string;
    description?: string;
  }) {
    await this.openAddActivityEditor();

    const nameInput = this.page.getByRole('textbox', { name: /Handle Inbound Emails/i });
    await nameInput.fill(options.name);
    await expect(nameInput).toHaveValue(options.name);

    const channel = options.channel ?? 'Send Text/SMS';
    await this.page.getByText(channel, { exact: true }).click();

    const sopSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /No SOP selected/i }) })
      .first();
    await expect(sopSelect).toBeVisible();

    if (options.sop) {
      await sopSelect.selectOption({ label: options.sop });
    } else {
      const sopRequired = await this.page
        .locator('strong', { hasText: /^Select SOP$/i })
        .locator('xpath=..')
        .getByText('*')
        .isVisible()
        .catch(() => false);
      if (sopRequired) {
        const sopLabels = (await sopSelect.locator('option').allTextContents()).map((label) => label.trim());
        const sopLabel = sopLabels.find((label) => label && !/No SOP selected/i.test(label));
        expect(sopLabel, 'expected at least one SOP option when SOP is required').toBeTruthy();
        await sopSelect.selectOption({ label: sopLabel! });
      }
    }

    if (options.description) {
      await this.page.getByPlaceholder(/Optional description/i).fill(options.description);
    }

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/virtual-assistant\/assistants\//.test(response.url()) &&
        response.request().method() === 'PUT' &&
        response.status() === 200,
      { timeout: 30000 }
    );

    const saveButton = this.page.getByRole('button', { name: /Save Activity/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await saveResponse;

    await expect(this.page.getByRole('heading', { name: 'Activities', exact: true })).toBeVisible({
      timeout: 15000
    });
    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({
      timeout: 15000
    });
  }

  async expectActivityInList(name: string) {
    await expect(this.page.getByRole('heading', { name: 'Activities', exact: true })).toBeVisible();
    await expect(this.page.getByRole('row').filter({ hasText: name }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteActivity(name: string) {
    await expect(this.page.getByRole('heading', { name: 'Activities', exact: true })).toBeVisible();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Remove"], button:has(.fa-trash)').first()
    });
  }
}

export class AskPrudensPage {
  readonly page: Page;
  readonly workbench: Locator;
  readonly agentSelect: Locator;
  readonly sessionTitleInput: Locator;
  readonly createSessionButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.workbench = page.locator('#ai-workbench-app');
    this.agentSelect = page.locator('select').filter({
      has: page.locator('option', { hasText: 'Certificate Review' })
    });
    this.sessionTitleInput = page.getByRole('textbox', { name: /Optional title/i });
    this.createSessionButton = page.getByRole('button', { name: /Create Session/i });
  }

  async goto() {
    await this.page.goto('/virtual-assistant/ask-prudens');
    await this.page.waitForURL(/\/virtual-assistant\/ask-prudens/);
    await this.page.waitForLoadState('networkidle');
    await this.dismissAppSidebarOverlap();
    await this.dismissSessionLoadErrorIfPresent();
  }

  async dismissAppSidebarOverlap() {
    await this.page.evaluate(() => {
      const sidebar = document.querySelector('.app-sidebar');
      if (sidebar instanceof HTMLElement) {
        sidebar.style.display = 'none';
      }
    });
  }

  async dismissSessionLoadErrorIfPresent() {
    const errorDialog = this.page.getByRole('dialog', { name: 'Error' });
    if (await errorDialog.isVisible()) {
      await errorDialog.getByRole('button', { name: 'OK' }).click();
    }
  }

  async openSessionSidebar() {
    const searchSessions = this.page.getByRole('textbox', { name: /Search sessions/i });
    if (await searchSessions.isVisible()) {
      return;
    }

    await this.workbench.getByTitle('Expand').click({ force: true });
    await expect(searchSessions).toBeVisible({ timeout: 10000 });
  }

  async startAskPrudensChatSession(accountName: string, title: string, agent = 'Demo', resourceSearch?: string) {
    await this.openSessionSidebar();
    await this.workbench.getByText('New chat').click({ force: true });
    await expect(this.page.getByRole('heading', { name: /What would you like to create/i })).toBeVisible();

    await this.page.locator('div').filter({ hasText: /^Ask PrudensGeneral AI Q&A$/ }).first().click();
    await expect(this.page.getByRole('heading', { name: /Pick an account for "Ask Prudens"/i })).toBeVisible();

    await this.page.getByRole('textbox', { name: /Search accounts/i }).fill(accountName);
    await this.page.waitForTimeout(1500);

    const accountRow = this.page.getByRole('row').filter({ hasText: accountName }).first();
    await expect(accountRow).toBeVisible({ timeout: 15000 });

    const selectButton = accountRow.getByRole('button').last();
    if (await selectButton.isVisible()) {
      await selectButton.click();
    } else {
      await accountRow.click();
    }

    await expect(this.page.getByRole('heading', { name: new RegExp(`Ask Prudens — ${accountName}`, 'i') })).toBeVisible({
      timeout: 15000
    });

    await this.agentSelect.selectOption({ label: agent });
    await this.sessionTitleInput.fill(title);
    const selectedResource = resourceSearch ? await this.selectFirstExistingResource(resourceSearch) : undefined;
    await expect(this.createSessionButton).toBeEnabled();
    await this.createSessionButton.click();
    await expect(this.page.getByRole('button', { name: 'Chat' })).toBeVisible({ timeout: 30000 });
    await this.collapseSessionSidebar();
    return selectedResource;
  }

  async selectFirstExistingResource(searchTerm: string) {
    const resourceSelect = this.page.locator('.resource-select-wrapper');
    const resourceSearch = resourceSelect.locator('input[type="search"]').first();
    await expect(resourceSearch).toBeVisible({ timeout: 15000 });
    await resourceSearch.fill(searchTerm);

    const firstOption = this.page.locator('.vs__dropdown-option').filter({ hasText: searchTerm }).first();
    await expect(firstOption).toBeVisible({ timeout: 15000 });
    const resourceName = ((await firstOption.textContent()) ?? '').replace(/\([^)]*\)/g, '').trim();
    await firstOption.click();

    await expect(resourceSelect.locator('.vs__selected').filter({ hasText: resourceName }).first()).toBeVisible();
    return resourceName;
  }

  async expectAskPrudensChatReady(title: string, options: { accountName?: string; agent?: string } = {}) {
    const accountName = options.accountName ?? 'Demo';
    const agent = options.agent ?? 'Demo';
    const sessionBanner = this.page.getByRole('banner').filter({ hasText: title }).first();

    await expect(sessionBanner).toBeVisible({ timeout: 30000 });
    await expect(sessionBanner).toContainText(accountName);
    await expect(sessionBanner).toContainText(/draft/i);
    await expect(sessionBanner.getByRole('button', { name: 'Chat' })).toBeVisible();
    await expect(sessionBanner.getByRole('button', { name: /Sources/i })).toBeVisible();
    await expect(sessionBanner.getByRole('button', { name: /Activities/i })).toBeVisible();
    await expect(sessionBanner.getByRole('button', { name: new RegExp(agent, 'i') })).toBeVisible();
    await expect(sessionBanner.getByRole('button', { name: /SOP/i })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Ask Prudens anything/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Ask/i })).toBeDisabled();
  }

  async expectAskPrudensSessionTabs(resourceName?: string) {
    await this.page.getByRole('button', { name: 'Chat' }).click();
    await expect(this.workbench.getByText(/Send a message to start/i)).toBeVisible();
    await expect(this.page.getByPlaceholder(/Ask Prudens anything/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Ask/i })).toBeDisabled();

    await this.page.getByRole('button', { name: /Sources/i }).click();
    await expect(this.workbench.locator('li').filter({ hasText: /^Documents$/ })).toBeVisible();
    await expect(this.workbench.getByText('Add sources')).toBeVisible();
    if (resourceName) {
      await expect(this.workbench.getByText(resourceName).first()).toBeVisible();
    } else {
      await expect(this.workbench.getByText(/No sources attached/i)).toBeVisible();
    }

    await this.page.getByRole('button', { name: /Activities/i }).click();
    await expect(this.workbench.getByText('Activities').last()).toBeVisible();
    await expect(this.workbench.getByText(/No activities yet/i)).toBeVisible();
  }

  async expectAskPrudensAgentDialog(agent = 'Demo') {
    await this.page.getByRole('button', { name: new RegExp(agent, 'i') }).click();
    const dialog = this.page.getByRole('dialog', { name: /Switch Agent/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Choose a different agent/i)).toBeVisible();
    await expect(dialog.getByRole('combobox')).toHaveValue(/.+/);
    await expect(dialog.getByRole('combobox')).toContainText(agent);
    await expect(dialog.getByRole('button', { name: /Switch/i })).toBeVisible();
    await dialog.getByRole('button', { name: /Cancel/i }).click();
    await expect(dialog).toBeHidden();
  }

  async expectAskPrudensSopDialog() {
    await this.page.getByRole('button', { name: /SOP/i }).click();
    const dialog = this.page.getByRole('dialog', { name: /Select SOP/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText(/Attach a Standard Operating Procedure/i)).toBeVisible();
    await expect(dialog.getByRole('combobox')).toBeVisible();
    await expect(dialog.getByRole('button', { name: /Apply/i })).toBeVisible();
    await dialog.getByRole('button', { name: /Cancel/i }).click();
    await expect(dialog).toBeHidden();
  }

  async collapseSessionSidebar() {
    const collapse = this.workbench.getByTitle('Collapse');
    if (await collapse.isVisible()) {
      await collapse.click({ force: true });
    }
  }

  async sendMessage(message: string) {
    const chatInput = this.page.getByPlaceholder(/Ask Prudens anything/i);
    await expect(chatInput).toBeVisible();
    await chatInput.fill(message);
    await expect(chatInput).toHaveValue(message);

    const askButton = this.page.getByRole('button', { name: 'Ask' });
    await expect(askButton).toBeEnabled();
    await askButton.click();

    const userMessage = this.workbench.locator('.aw-msg--user .aw-msg__content').filter({ hasText: message }).last();
    await expect(userMessage).toBeVisible({ timeout: 15000 });
    await expect(chatInput).toHaveValue('');
  }

  async expectChatResponse(message?: string) {
    if (message) {
      const userMessage = this.workbench.locator('.aw-msg--user .aw-msg__content').filter({ hasText: message }).last();
      await expect(userMessage).toBeVisible();
    }

    const assistantMessage = this.workbench.locator('.aw-msg--assistant .aw-msg__content').last();
    await expect(assistantMessage).toBeVisible({ timeout: 180000 });
    await expect(assistantMessage).toContainText(
      /general liability|insurance|coverage|liability|policy|knowledge base/i,
      { timeout: 180000 }
    );
    await expect(this.page.getByPlaceholder(/Ask Prudens anything/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Ask/i })).toBeDisabled();
  }

  async expectPageShell() {
    await expectPageBaseline(this.page, {
      url: /\/virtual-assistant\/ask-prudens/,
      visibleText: [/Ask Prudens\s+AI Workbench/i],
      buttons: [/Back/i]
    });
  }

  async expectSessionSidebarControls() {
    await this.openSessionSidebar();
    await this.dismissSessionLoadErrorIfPresent();

    const sidebar = this.workbench.getByRole('complementary');
    await expect(sidebar).toBeVisible();
    await expect(sidebar.getByRole('textbox', { name: /Search sessions/i })).toBeVisible();
    await expect(sidebar.getByRole('combobox').nth(0)).toBeVisible();
    await expect(sidebar.getByRole('combobox').nth(1)).toBeVisible();
    await expect(sidebar.getByText('New chat')).toBeVisible();
    await expect(sidebar.getByText('Accounts')).toBeVisible();
    await expect(sidebar.getByText('Settings')).toBeVisible();
    await expect(sidebar.getByText('Assistants')).toBeVisible();
    await expect(sidebar.getByText('Chats')).toBeVisible();
  }

  async expectWorkbench() {
    const workbench = this.workbench;

    await expect(this.page).toHaveURL(/\/virtual-assistant\/ask-prudens/);
    await expect(workbench).toBeVisible();

    const emptyState = workbench.getByRole('heading', { name: 'AI Workbench' });
    const activeSession = workbench.getByRole('button', { name: 'Chat' });
    await expect(emptyState.or(activeSession).first()).toBeVisible();

    if (await emptyState.isVisible()) {
      await expect(this.page.getByRole('textbox', { name: /Search sessions/i })).toBeVisible();
      await expect(workbench.getByText('New chat')).toBeVisible();
      await expect(workbench.getByText('Accounts').first()).toBeVisible();
      await expect(workbench.getByText('Settings').first()).toBeVisible();
    } else {
      await expect(activeSession).toBeVisible();
      await expect(workbench.getByRole('textbox').first()).toBeVisible();
    }
  }

  async deleteSession(title: string) {
    await this.goto();
    await this.openSessionSidebar();
    await this.dismissSessionLoadErrorIfPresent();

    const searchSessions = this.page.getByRole('textbox', { name: /Search sessions/i });
    await searchSessions.fill(title);
    await this.page.waitForTimeout(1000);

    const sessionItem = this.workbench.locator('li.aw-nav__item.aw-nav__item--nested').filter({ hasText: title }).first();
    await expect(sessionItem).toHaveCount(1, { timeout: 15000 });

    await confirmDestructiveAction(this.page, async () => {
      // Nested chat delete control is CSS-hidden until hover; invoke click in DOM.
      await sessionItem.locator('button.aw-nav__del').evaluate((button) => {
        (button as HTMLElement).click();
      });
    });

    await expect(this.workbench.locator('li.aw-nav__item.aw-nav__item--nested').filter({ hasText: title })).toHaveCount(0, {
      timeout: 15000
    });
  }
}

export class VirtualAssistantObserversPage {
  readonly page: Page;
  readonly newObserverButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newObserverButton = page.getByRole('button', { name: /New Observer/i });
  }

  async goto() {
    await this.page.goto('/virtual-assistant-observers');
    await this.page.waitForURL(/\/virtual-assistant-observers/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectObserversPage() {
    await expect(this.page.getByRole('heading', { name: 'Observers' })).toBeVisible();
    await expect(this.page.getByText('Observer Center')).toBeVisible();
    await expect(this.newObserverButton).toBeVisible();
  }

  async openNewObserverForm() {
    await this.newObserverButton.click();
    await expect(this.page.getByRole('heading', { name: 'Create Observer' })).toBeVisible();
    await expect(this.page.getByPlaceholder(/New commercial policy updates/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Observer/i })).toBeVisible();
  }

  async createObserver(options: { name: string; description: string; source?: string }) {
    await this.page.getByPlaceholder(/New commercial policy updates/i).fill(options.name);
    await this.page.getByPlaceholder(/Describe what should be monitored/i).fill(options.description);

    const sourceSelect = this.page.locator('select').filter({ has: this.page.locator('option', { hasText: 'Select source...' }) });
    await sourceSelect.selectOption(options.source ?? 'HubSpot');

    await this.page.getByRole('button', { name: /Save Observer/i }).click();

    const savedDialog = this.page.getByRole('dialog', { name: 'Saved' });
    await expect(savedDialog).toBeVisible({ timeout: 15000 });
    await savedDialog.getByRole('button', { name: 'OK' }).click();
    await expect(savedDialog).toBeHidden();

    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteObserver(name: string) {
    await this.goto();
    await this.expectObserversPage();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.getByRole('button', { name: /Delete observer/i })
    });
  }
}

export class VirtualAssistantSettingsPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(section?: 'knowledge-base' | 'forms' | 'tools' | 'verifications' | 'escalations' | 'simulate') {
    const path = section ? `/virtual-assistant-settings?section=${section}` : '/virtual-assistant-settings';
    await this.page.goto(path);
    await this.page.waitForURL(/\/virtual-assistant-settings/);
    await this.page.waitForLoadState('networkidle');
  }

  async gotoTriggerAdmin() {
    await this.page.goto('/virtual-assistant-settings/triggers');
    await this.page.waitForURL(/\/virtual-assistant-settings\/triggers/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectPageShell() {
    await expectPageBaseline(this.page, {
      url: /\/virtual-assistant-settings/,
      visibleText: ['Virtual Assistant Settings', /Configure data capture, forms, tools, and other settings/i],
      headings: ['Settings']
    });
    await expect(this.page.getByRole('link', { name: /Assistants/i }).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /Live Data/i }).first()).toBeVisible();
    await expect(this.settingsNavLink('Knowledge Base')).toBeVisible();
    await expect(this.settingsNavLink('Forms')).toBeVisible();
    await expect(this.settingsNavLink('Tools')).toBeVisible();
    await expect(this.settingsNavLink('Trigger')).toBeVisible();
    await expect(this.settingsNavLink('Verifications')).toBeVisible();
    await expect(this.settingsNavLink('Escalations')).toBeVisible();
    await expect(this.settingsNavLink('Simulate')).toBeVisible();
  }

  settingsNavLink(name: string) {
    return this.page.locator('a[href*="virtual-assistant-settings"]').filter({ hasText: name }).first();
  }

  async goToSection(section: 'Knowledge Base' | 'Forms' | 'Tools' | 'Trigger Admin' | 'Verifications' | 'Escalations' | 'Simulate') {
    if (section === 'Trigger Admin') {
      await this.settingsNavLink('Trigger').click();
      await this.page.waitForURL(/\/virtual-assistant-settings\/triggers/);
    } else {
      await this.settingsNavLink(section).click();
    }
    await this.page.waitForLoadState('networkidle');
  }

  async expectKnowledgeBasesSection() {
    await expect(this.page.getByRole('heading', { name: 'Knowledge Bases' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Add Knowledge Base/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Purpose' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Documents' })).toBeVisible();
  }

  async expectFormsSection() {
    await expect(this.page).toHaveURL(/section=forms/);
    await expect(this.page.getByRole('heading', { name: 'Forms' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /New Form/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Schema' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Fields' })).toBeVisible();
  }

  async expectToolsSection() {
    await expect(this.page).toHaveURL(/section=tools/);
    await expect(this.page.getByRole('heading', { name: 'Agent Tools' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Add Tool/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Provider' })).toBeVisible();
  }

  async openNewFormEditor() {
    await this.page.getByRole('button', { name: /New Form/i }).click();
    await expect(this.page.getByText('New Form').first()).toBeVisible();
    await expect(this.page.getByRole('tab', { name: 'Form Details' })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: 'Schema' })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: 'Field Selection' })).toBeVisible();
    await expect(this.page.getByRole('tab', { name: 'Embed' })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Enter form name/i)).toBeVisible();
  }

  async openFormEditorTab(tab: 'Form Details' | 'Schema' | 'Field Selection' | 'Embed') {
    await this.page.getByRole('tab', { name: tab }).click();
  }

  async expectFormEditorTabsShell() {
    await this.openFormEditorTab('Form Details');
    await expect(this.page.getByPlaceholder(/Enter form name/i)).toBeVisible();
    await expect(this.page.getByText(/Description/i).first()).toBeVisible();

    await this.openFormEditorTab('Schema');
    await this.expectFormSchemaManagementShell();

    await this.openFormEditorTab('Field Selection');
    await expect(
      this.page
        .getByText(/No Schema Linked/i)
        .or(this.page.getByText(/Link a schema first/i))
        .or(this.page.getByRole('button', { name: /Link Schema/i }))
        .or(this.page.getByText(/Select fields/i))
        .first()
    ).toBeVisible({ timeout: 15000 });

    await this.openFormEditorTab('Embed');
    await expect(
      this.page
        .getByText(/Save the form first to generate a public URL/i)
        .or(this.page.getByText(/FORM SETTINGS/i))
        .or(this.page.getByText(/Submit Button Text/i))
        .first()
    ).toBeVisible({ timeout: 15000 });
  }

  async expectFormSchemaManagementShell() {
    await expect(this.page.getByText(/Schema Management/i).first()).toBeVisible({ timeout: 15000 });
    await expect(
      this.page
        .getByText(/No schema defined yet/i)
        .or(this.page.getByRole('button', { name: /Add Schema/i }))
        .or(this.page.getByRole('button', { name: /Edit Schema/i }))
        .or(this.page.getByText(/linked schema/i))
        .first()
    ).toBeVisible();
  }

  async createForm(options: { name: string; description?: string }) {
    await this.page.getByPlaceholder(/Enter form name/i).fill(options.name);
    if (options.description) {
      await this.page.getByPlaceholder(/Describe this form/i).fill(options.description);
    }

    const saveButton = this.page.getByRole('button', { name: /Save Form/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    const successDialog = this.page.getByRole('dialog', { name: 'Success' });
    await expect(successDialog).toBeVisible({ timeout: 15000 });
    await successDialog.getByRole('button', { name: 'OK' }).click();
    await expect(successDialog).toBeHidden();

    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteForm(name: string) {
    await this.goto('forms');
    await this.expectFormsSection();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
  }

  async openAddKnowledgeBaseEditor() {
    await this.page.getByRole('button', { name: /Add Knowledge Base/i }).click();
    await expect(this.page.getByPlaceholder(/Product Documentation/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Knowledge Base/i })).toBeVisible();
  }

  async createKnowledgeBase(options: { name: string; purpose: string }) {
    await this.page.getByPlaceholder(/Product Documentation/i).fill(options.name);
    await this.page.getByPlaceholder(/Describe what this knowledge base/i).fill(options.purpose);

    const saveButton = this.page.getByRole('button', { name: /Save Knowledge Base/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(this.page.getByRole('heading', { name: 'Knowledge Bases' })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({ timeout: 15000 });
  }

  async openKnowledgeBaseEditor(name: string) {
    const row = this.page.getByRole('row').filter({ hasText: name }).first();
    await expect(row).toBeVisible({ timeout: 15000 });
    const editButton = row.locator('button[title="Edit"], button[title*="Edit" i], button:has(.fa-edit), button:has(.fa-pen)').first();
    if (await editButton.isVisible().catch(() => false)) {
      await editButton.click();
    } else {
      await row.getByText(name, { exact: true }).click();
    }
    await expect(this.page.getByRole('button', { name: /Save Knowledge Base/i })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('button', { name: /Add Documents/i })).toBeVisible();
  }

  async openKnowledgeBaseAddDocuments() {
    await this.page.getByRole('button', { name: /Add Documents/i }).click();
    await expect(this.page.getByRole('heading', { name: /Add New Resource/i })).toBeVisible({ timeout: 15000 });
    await this.page.getByText(/Upload PDF, Word, Markdown, or text documents/i).click();
    await expect(this.page.getByRole('heading', { name: /^Document$/i })).toBeVisible({ timeout: 15000 });
  }

  async expectKnowledgeBaseDocumentUploadSurface() {
    await expect(this.page.getByRole('heading', { name: /^Document$/i })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Enter account name/i)).toBeVisible();
    await expect(this.page.locator('input[type="file"]').first()).toBeAttached();
    await expect(
      this.page
        .getByRole('button', { name: /Browse Files/i })
        .or(this.page.getByText(/Drag and drop your file here/i))
        .first()
    ).toBeVisible();
  }

  async prepareKnowledgeBaseDocumentUpload(options: { filePath: string; accountName: string; fileName: string }) {
    await this.page.locator('input[type="file"]').first().setInputFiles(options.filePath);
    await expect(this.page.getByText(options.fileName, { exact: true })).toBeVisible({ timeout: 15000 });
    await this.page.getByPlaceholder(/Enter account name/i).fill(options.accountName);
    await expect(this.page.getByRole('button', { name: /Upload Document/i })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Upload Document/i })).toBeEnabled();
  }

  /**
   * Attempts document upload. Returns true when a document appears on the KB editor list.
   * Returns false when upload is blocked/fails after the upload surface was exercised.
   */
  async uploadKnowledgeBaseDocument(options: { fileName: string; documentLabel?: string | RegExp }): Promise<boolean> {
    const documentLabel = options.documentLabel ?? /Smoke Test Document A|smoke-doc-a\.pdf/i;
    await this.page.getByRole('button', { name: /Upload Document/i }).click();

    const processing = this.page.getByText(/Processing Document/i).first();
    const attachedDoc = this.page.getByText(documentLabel).first();
    await expect(processing.or(attachedDoc).first()).toBeVisible({ timeout: 30000 });

    if (await processing.isVisible().catch(() => false)) {
      const failed = this.page.locator('.document-section, [class*="processing"], [class*="modal"]').getByText(/Failed/i).first();
      const done = this.page.getByRole('button', { name: /^Done$/i });
      await expect(failed.or(done).or(attachedDoc).first()).toBeVisible({ timeout: 60000 });

      const uploadFailed = await failed.isVisible().catch(() => false);
      if (await done.isVisible().catch(() => false)) {
        await done.click();
        await expect(done).toBeHidden({ timeout: 15000 });
      }
      if (uploadFailed) {
        return false;
      }
    }

    const noDocumentsYet = this.page.getByText(/No documents added yet/i);
    await expect(attachedDoc.or(noDocumentsYet).first()).toBeVisible({ timeout: 15000 });
    if (await attachedDoc.isVisible().catch(() => false)) {
      return true;
    }
    return false;
  }

  async cancelKnowledgeBaseDocumentUpload() {
    const documentHeading = this.page.getByRole('heading', { name: /^Document$/i });
    if (await documentHeading.isVisible().catch(() => false)) {
      const documentPanel = this.page.locator('.document-section').filter({ has: documentHeading });
      await documentPanel.getByRole('button', { name: /^Cancel$/i }).click();
    }

    const resourceHeading = this.page.getByRole('heading', { name: /Add New Resource/i });
    if (await resourceHeading.isVisible().catch(() => false)) {
      await this.page.keyboard.press('Escape');
      if (await resourceHeading.isVisible().catch(() => false)) {
        await this.page.locator('.modal.show button.btn-close, .modal.show .close, [class*="resource"] button.close').first().click().catch(() => undefined);
      }
    }

    await expect(this.page.getByRole('button', { name: /Save Knowledge Base/i })).toBeVisible({ timeout: 15000 });
  }

  async cancelKnowledgeBaseEditor() {
    const saveVisible = await this.page.getByRole('button', { name: /Save Knowledge Base/i }).isVisible().catch(() => false);
    if (saveVisible) {
      await this.page.getByRole('button', { name: /^Cancel$/i }).last().click();
      await expect(this.page.getByRole('heading', { name: 'Knowledge Bases' })).toBeVisible({ timeout: 15000 });
    }
  }

  async deleteKnowledgeBase(name: string) {
    await this.goto();
    await this.expectKnowledgeBasesSection();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
  }

  async deleteKnowledgeBaseIfPresent(name: string) {
    await this.goto();
    await this.expectKnowledgeBasesSection();
    const row = this.page.getByRole('row').filter({ hasText: name });
    if ((await row.count()) === 0) {
      return;
    }
    await deleteRowByName(this.page, name, {
      deleteButton: (r) => r.locator('button[title="Delete"]').first()
    });
  }

  async openAddToolEditor() {
    await this.page.getByRole('button', { name: /Add Tool/i }).click();
    await expect(this.page.getByRole('heading', { name: 'New Tool' })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Enter tool name/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Tool/i })).toBeVisible();
  }

  async createTool(options: { name: string; description: string; type?: string }) {
    await this.page.getByPlaceholder(/Enter tool name/i).fill(options.name);
    await this.page.locator('select').first().selectOption({ label: options.type ?? 'Internal Function' });
    await this.page.getByPlaceholder(/Describe what this tool does/i).fill(options.description);

    const saveButton = this.page.getByRole('button', { name: /Save Tool/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(this.page.getByRole('heading', { name: 'Agent Tools' })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({ timeout: 15000 });
  }

  async createApiTool(options: {
    name: string;
    description: string;
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headersJson?: string;
  }) {
    await this.page.getByPlaceholder(/Enter tool name/i).fill(options.name);
    await this.page.locator('select').first().selectOption({ label: 'API' });
    await this.page.getByPlaceholder(/Describe what this tool does/i).fill(options.description);

    await expect(this.page.getByText(/API CONFIGURATION/i)).toBeVisible();
    await this.page.locator('select').nth(1).selectOption(options.method ?? 'GET');
    await this.page.getByPlaceholder(/https:\/\/api\.example\.com\/endpoint/i).fill(options.endpoint);

    if (options.headersJson) {
      await this.page
        .getByPlaceholder(/Authorization.*Bearer|Content-Type.*application\/json/i)
        .fill(options.headersJson);
    }

    const saveButton = this.page.getByRole('button', { name: /Save Tool/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await expect(this.page.getByRole('heading', { name: 'Agent Tools' })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteTool(name: string) {
    await this.goto('tools');
    await this.expectToolsSection();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button.btn-outline-danger, button:has(.fa-trash)').first()
    });
  }

  async expectTriggerAdminSection() {
    await expect(this.page).toHaveURL(/\/virtual-assistant-settings\/triggers/);
    await expect(this.page.getByRole('heading', { name: 'Triggers' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /New Trigger/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Event' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Integration Mapping' })).toBeVisible();
  }

  async openNewTriggerEditor() {
    await this.page.getByRole('button', { name: /New Trigger/i }).click();
    await expect(this.page.getByRole('heading', { name: 'New Trigger' })).toBeVisible();
    await expect(this.page.getByPlaceholder(/New account workflow handoff/i)).toBeVisible();
    await expect(this.page.getByPlaceholder(/Describe the trigger behavior/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Trigger/i })).toBeVisible();
  }

  async createTrigger(options: {
    name: string;
    description?: string;
    model?: string;
    status?: string;
    schemaLabel?: string;
  }) {
    await this.openNewTriggerEditor();

    await this.page.getByPlaceholder(/New account workflow handoff/i).fill(options.name);
    await expect(this.page.getByPlaceholder(/New account workflow handoff/i)).toHaveValue(options.name);

    const description = options.description ?? 'Smoke test trigger created by Playwright.';
    await this.page.getByPlaceholder(/Describe the trigger behavior/i).fill(description);

    const modelSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /^New$/i }) })
      .first();
    await modelSelect.selectOption({ label: options.model ?? 'New' });

    const statusSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /^Active$/i }) })
      .first();
    await statusSelect.selectOption({ label: options.status ?? 'Active' });

    const schemaSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /Select schema/i }) })
      .first();
    await expect(schemaSelect).toBeVisible({ timeout: 15000 });
    await expect
      .poll(async () => schemaSelect.locator('option').count(), { timeout: 30000 })
      .toBeGreaterThan(1);

    const schemaLabels = (await schemaSelect.locator('option').allTextContents()).map((label) => label.trim());
    const schemaLabel =
      options.schemaLabel ??
      schemaLabels.find((label) => /^TestSchema$/i.test(label)) ??
      schemaLabels.find((label) => /^QA Test$/i.test(label)) ??
      schemaLabels.find((label) => label && !/Select schema/i.test(label));
    expect(schemaLabel, 'expected at least one schema option').toBeTruthy();
    await schemaSelect.selectOption({ label: schemaLabel! });

    const integrationSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /Select integration/i }) })
      .first();
    await expect(integrationSelect).toBeVisible({ timeout: 15000 });
    await expect
      .poll(async () => integrationSelect.locator('option').count(), { timeout: 30000 })
      .toBeGreaterThan(1);

    const integrationLabels = (await integrationSelect.locator('option').allTextContents()).map((label) =>
      label.trim()
    );
    const integrationLabel = integrationLabels.find((label) => label && !/Select integration/i.test(label));
    expect(integrationLabel, 'expected at least one integration option').toBeTruthy();
    await integrationSelect.selectOption({ label: integrationLabel! });

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/virtual-assistant\/triggers\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    await this.page.getByRole('button', { name: /Save Trigger/i }).click();
    await saveResponse;

    const okButton = this.page.getByRole('button', { name: /^OK$/i });
    if (await okButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await okButton.click();
    }

    await expect(this.page.getByRole('heading', { name: 'Triggers' })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({
      timeout: 15000
    });
  }

  async expectTriggerInList(name: string) {
    await this.gotoTriggerAdmin();
    await this.expectTriggerAdminSection();
    await expect(this.page.getByRole('row').filter({ hasText: name }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteTrigger(name: string) {
    await this.gotoTriggerAdmin();
    await this.expectTriggerAdminSection();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
  }

  async expectVerificationsSection() {
    await expect(this.page).toHaveURL(/section=verifications/);
    await expect(this.page.getByRole('button', { name: /Add Verification/i })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('heading', { name: 'Verifications' })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('columnheader', { name: 'Scope' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Provider' })).toBeVisible();
  }

  async openAddVerificationEditor() {
    await this.page.getByRole('button', { name: /Add Verification/i }).click();
    await expect(this.page.getByRole('heading', { name: /New Verification/i })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Customer Identity Check/i)).toBeVisible();
    await expect(this.page.getByText(/Verification Scope/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Verification/i })).toBeVisible();
  }

  async createVerification(options: {
    name: string;
    description?: string;
    providerLabel?: string;
    scope?: 'Email' | 'SMS/Text' | 'Phone';
  }) {
    await this.openAddVerificationEditor();

    await this.page.getByPlaceholder(/Customer Identity Check/i).fill(options.name);
    await expect(this.page.getByPlaceholder(/Customer Identity Check/i)).toHaveValue(options.name);

    const description = options.description ?? 'Smoke test verification created by Playwright.';
    await this.page.getByPlaceholder(/Describe what this verification is for/i).fill(description);

    await expect(this.page.getByText(/Loading providers/i)).toBeHidden({ timeout: 30000 }).catch(() => undefined);

    const providerSelect = this.page.getByRole('combobox').filter({
      has: this.page.getByRole('option', { name: /Select a provider/i })
    });
    await expect(providerSelect).toBeVisible({ timeout: 15000 });
    await expect
      .poll(async () => providerSelect.getByRole('option').count(), { timeout: 30000 })
      .toBeGreaterThan(1);

    const providerLabels = (await providerSelect.getByRole('option').allTextContents()).map((label) => label.trim());
    const providerLabel =
      options.providerLabel ??
      providerLabels.find((label) => /^HubSpotqa$/i.test(label)) ??
      providerLabels.find((label) => label && !/Select a provider/i.test(label));
    expect(providerLabel, 'expected at least one integration provider option').toBeTruthy();
    await providerSelect.selectOption({ label: providerLabel! });

    const scope = options.scope ?? 'Email';
    const scopeCheckbox =
      scope === 'Email'
        ? this.page.locator('#scope-email')
        : scope === 'SMS/Text'
          ? this.page.locator('#scope-sms')
          : this.page.locator('#scope-phone');
    await scopeCheckbox.check({ force: true });
    await expect(scopeCheckbox).toBeChecked();

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/virtual-assistant\/verifications\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    const saveButton = this.page.getByRole('button', { name: /Save Verification/i });
    await expect(saveButton).toBeEnabled({ timeout: 15000 });
    await saveButton.click();
    await saveResponse;

    const okButton = this.page.getByRole('button', { name: /^OK$/i });
    if (await okButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await okButton.click();
    }

    await expect(this.page.getByRole('heading', { name: 'Verifications' })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({
      timeout: 15000
    });
  }

  async expectVerificationInList(name: string) {
    await this.goto('verifications');
    await this.expectVerificationsSection();
    await expect(this.page.getByRole('row').filter({ hasText: name }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteVerification(name: string) {
    await this.goto('verifications');
    await this.expectVerificationsSection();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
  }

  async expectEscalationsSection() {
    await expect(this.page).toHaveURL(/section=escalations/);
    await expect(this.page.getByRole('heading', { name: /Escalations/i }).first()).toBeVisible();
    await expect(this.page.getByRole('heading', { level: 6, name: / Sync Escalations/ })).toBeVisible();
    await expect(this.page.getByRole('heading', { level: 6, name: / Async Escalations/ })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Settings/i })).toBeVisible();
  }

  private sectionPanel(sectionHeading: string | RegExp) {
    return this.page.locator('div').filter({ has: this.page.getByRole('heading', { name: sectionHeading }).first() }).first();
  }

  escalationsSubNavLink(name: 'Settings' | 'Escalation Groups' | 'Transfers') {
    return this.sectionPanel(/Escalations/i).locator('a').filter({ hasText: name }).first();
  }

  async goToEscalationsSubSection(sub: 'Settings' | 'Escalation Groups' | 'Transfers') {
    await this.escalationsSubNavLink(sub).click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectEscalationGroupsSection() {
    await expect(this.page.getByRole('button', { name: /Add Group/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Emails' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'When' })).toBeVisible();
  }

  async openAddEscalationGroupEditor() {
    await this.page.getByRole('button', { name: /Add Group/i }).click();
    await expect(this.page.getByText(/Escalation Group/i).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Group/i })).toBeVisible();
  }

  async createEscalationGroup(options: { name: string; when: string; emails?: string }) {
    await this.openAddEscalationGroupEditor();

    await this.page.getByPlaceholder(/e\.g\., Support Team/i).fill(options.name);
    await expect(this.page.getByPlaceholder(/e\.g\., Support Team/i)).toHaveValue(options.name);

    if (options.emails) {
      await this.page.getByPlaceholder(/john@example.com/i).fill(options.emails);
    }

    await this.page.getByPlaceholder(/Describe when this group should be escalated/i).fill(options.when);

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/virtual-assistant\/escalation-groups\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    const saveButton = this.page.getByRole('button', { name: /Save Group/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await saveResponse;

    const successDialog = this.page.getByRole('dialog').filter({ hasText: /success|saved|created/i });
    if (await successDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      await successDialog.getByRole('button', { name: /^OK$/i }).click();
    } else {
      const okButton = this.page.getByRole('button', { name: /^OK$/i });
      if (await okButton.isVisible().catch(() => false)) {
        await okButton.click();
      }
    }

    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({
      timeout: 15000
    });
  }

  async expectEscalationGroupInList(name: string) {
    await this.goto('escalations');
    await this.goToEscalationsSubSection('Escalation Groups');
    await this.expectEscalationGroupsSection();
    await expect(this.page.getByRole('row').filter({ hasText: name }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteEscalationGroup(name: string) {
    await this.goto('escalations');
    await this.goToEscalationsSubSection('Escalation Groups');
    await this.expectEscalationGroupsSection();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
  }

  async expectTransfersSection() {
    await expect(this.page.getByRole('button', { name: /Add Transfer/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Type' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Ring Groups' })).toBeVisible();
  }

  async openAddTransferEditor() {
    await this.page.getByRole('button', { name: /Add Transfer/i }).click();
    await expect(this.page.getByText(/Add Transfer|Edit Transfer/i).first()).toBeVisible();
    await expect(this.page.getByText(/Transfer Type/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Transfer/i })).toBeVisible();
  }

  async createTransfer(options: {
    name: string;
    when: string;
    number?: string;
    type?: 'Person' | 'Ring Group';
    timezone?: string;
  }) {
    await this.openAddTransferEditor();

    const type = options.type ?? 'Person';
    const typeSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /^Person$/i }) })
      .first();
    await typeSelect.selectOption({ label: type });

    await this.page.getByPlaceholder(/e\.g\., John Smith or Sales Team/i).fill(options.name);
    await expect(this.page.getByPlaceholder(/e\.g\., John Smith or Sales Team/i)).toHaveValue(options.name);

    const number = options.number ?? '1001';
    const numberInput = this.page.getByPlaceholder(/Enter number/i);
    await numberInput.fill(number);
    const addNumberButton = numberInput
      .locator('xpath=ancestor::*[self::div or self::form][1]//button[contains(., "Add")]')
      .first();
    await addNumberButton.click();
    await expect(this.page.getByText(number).first()).toBeVisible({ timeout: 5000 });

    const timezone = options.timezone ?? 'Eastern Time (ET)';
    const tzSelect = this.page
      .locator('select')
      .filter({ has: this.page.locator('option', { hasText: /Select timezone/i }) })
      .first();
    if (await tzSelect.isVisible().catch(() => false)) {
      await tzSelect.selectOption({ label: timezone });
    }

    await this.page.getByPlaceholder(/Describe when this transfer should be used/i).fill(options.when);

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/virtual-assistant\/transfers\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    const saveButton = this.page.getByRole('button', { name: /Save Transfer/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await saveResponse;

    const successDialog = this.page.getByRole('dialog').filter({ hasText: /success|saved|created/i });
    if (await successDialog.isVisible({ timeout: 5000 }).catch(() => false)) {
      await successDialog.getByRole('button', { name: /^OK$/i }).click();
    } else {
      const okButton = this.page.getByRole('button', { name: /^OK$/i });
      if (await okButton.isVisible().catch(() => false)) {
        await okButton.click();
      }
    }

    await expect(this.page.getByRole('row').filter({ hasText: options.name }).first()).toBeVisible({
      timeout: 15000
    });
  }

  async expectTransferInList(name: string) {
    await this.goto('escalations');
    await this.goToEscalationsSubSection('Transfers');
    await this.expectTransfersSection();
    await expect(this.page.getByRole('row').filter({ hasText: name }).first()).toBeVisible({ timeout: 15000 });
  }

  async deleteTransfer(name: string) {
    await this.goto('escalations');
    await this.goToEscalationsSubSection('Transfers');
    await this.expectTransfersSection();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
  }

  simulateSubNavLink(name: 'Situations' | 'Test') {
    return this.page.locator('a.nav-link').filter({ hasText: new RegExp(`^\\s*${name}\\s*$`) }).first();
  }

  async goToSimulateSubSection(sub: 'Situations' | 'Test') {
    const tab = this.simulateSubNavLink(sub);
    if (sub === 'Test' && (await tab.getAttribute('disabled')) !== null) {
      await this.openFirstAgentTestFromSituations();
      return;
    }
    await tab.click();
    await this.page.waitForLoadState('networkidle');
  }

  async waitForSimulateAgentsLoaded() {
    const loading = this.page.getByText('Loading agents...');
    if (await loading.isVisible().catch(() => false)) {
      await expect(loading).toBeHidden({ timeout: 30000 });
    }
  }

  async expectSimulateSituationsTab() {
    await expect(this.page.getByRole('button', { name: /Refresh/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Agent Name' })).toBeVisible();
    await this.waitForSimulateAgentsLoaded();
    const testButton = this.page.getByRole('button', { name: /Test/i });
    const emptyState = this.page.getByText(/No Agents Available|Create an Assistant with Activities/i);
    await expect(testButton.first().or(emptyState).first()).toBeVisible({ timeout: 15000 });
  }

  async expectSimulateTestTab() {
    await expect(this.page.getByText(/Start a conversation with the agent|Type a message below/i).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Change Agent/i })).toBeVisible();
  }

  async openFirstAgentTestFromSituations() {
    await this.waitForSimulateAgentsLoaded();
    const agentsTable = this.page.getByRole('table').filter({
      has: this.page.getByRole('columnheader', { name: 'Agent Name' })
    });
    await agentsTable.getByTitle('Test Agent').first().click();
    await this.expectSimulateTestTab();
  }

  simulateChatMessages() {
    return this.page.locator('.simulation-chat-messages');
  }

  async sendSimulateTestMessage(message: string) {
    const chatInput = this.page.getByPlaceholder(/Type a message to test the agent/i);
    await expect(chatInput).toBeVisible();
    await chatInput.fill(message);
    await expect(chatInput).toHaveValue(message);
    await chatInput.press('Enter');

    await expect(this.simulateChatMessages().getByText(message, { exact: true })).toBeVisible({
      timeout: 15000
    });
    await expect(chatInput).toHaveValue('');
  }

  async expectSimulateTestResponse(userMessage?: string) {
    const chat = this.simulateChatMessages();
    if (userMessage) {
      await expect(chat.getByText(userMessage, { exact: true })).toBeVisible();
    }

    const assistantBubble = chat.locator('.d-flex.justify-content-start .bg-white.border .small').last();
    await expect(assistantBubble).toBeVisible({ timeout: 180000 });
    await expect(assistantBubble).not.toHaveText(/^\s*$/);
    await expect(assistantBubble).not.toHaveText(/Thinking/i);
  }

  async clearSimulateTestConversation() {
    const clearButton = this.page.getByTitle('Clear conversation');
    if (!(await clearButton.isVisible().catch(() => false))) {
      return;
    }
    await clearButton.click();
  }

  async leaveSimulateTestChat() {
    const changeAgent = this.page.getByRole('button', { name: /Change Agent/i });
    if (await changeAgent.isVisible().catch(() => false)) {
      await changeAgent.click();
    }
    await this.expectSimulateSituationsTab();
  }

  async navigateAllSettingsSections() {
    await this.expectKnowledgeBasesSection();

    await this.goToSection('Forms');
    await this.expectFormsSection();

    await this.goToSection('Tools');
    await this.expectToolsSection();

    await this.goToSection('Trigger Admin');
    await this.expectTriggerAdminSection();

    await this.goToSection('Verifications');
    await this.expectVerificationsSection();

    await this.goToSection('Escalations');
    await this.expectEscalationsSection();

    await this.goToSection('Simulate');
    await this.expectSimulateSection();
  }

  async expectSimulateSection() {
    await expect(this.page).toHaveURL(/section=simulate/);
    await expect(this.page.getByRole('heading', { name: 'Simulate' })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Refresh/i })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Agent Name' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Event Trigger' })).toBeVisible();
  }
}

export class VirtualAssistantLivePage {
  readonly page: Page;
  readonly liveNav: Locator;

  constructor(page: Page) {
    this.page = page;
    this.liveNav = page.locator('#virtual-assistant-live-nav');
  }

  async goto() {
    await this.page.goto('/virtual-assistant-live');
    await this.page.waitForURL(/\/virtual-assistant-live/);
    await this.page.waitForLoadState('networkidle');
    await this.dismissAppSidebarOverlap();
  }

  async dismissAppSidebarOverlap() {
    await this.page.evaluate(() => {
      const sidebar = document.querySelector('.app-sidebar');
      if (sidebar instanceof HTMLElement) {
        sidebar.style.display = 'none';
      }
    });
  }

  async expectLiveDataPage() {
    await expect(this.page).toHaveURL(/\/virtual-assistant-live/);
    await expect(this.page.getByRole('heading', { name: /Live Data/i }).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /Assistants/i }).first()).toBeVisible();
  }

  async expectMonitoringNav() {
    await expect(this.liveNav).toBeVisible();
    for (const itemClass of [
      'nav-item-activities',
      'nav-item-inbox',
      'nav-item-sms',
      'nav-item-calls',
      'nav-item-qa',
      'nav-item-escalations-live'
    ] as const) {
      await expect(this.liveNav.locator(`a.${itemClass}`)).toBeVisible();
    }
  }

  async goToPanel(
    panel:
      | 'Activities'
      | 'Inbox'
      | 'SMS'
      | 'Calls'
      | 'QA'
      | 'Escalations'
      | 'Continual Improvement'
      | 'Assistants Todo List'
      | 'Form Submissions'
  ) {
    const itemClassByPanel = {
      Activities: 'nav-item-activities',
      Inbox: 'nav-item-inbox',
      SMS: 'nav-item-sms',
      Calls: 'nav-item-calls',
      QA: 'nav-item-qa',
      Escalations: 'nav-item-escalations-live',
      'Continual Improvement': 'nav-item-continual-improvement',
      'Assistants Todo List': 'nav-item-todo-list',
      'Form Submissions': 'nav-item-form-submissions'
    } as const;

    const link = this.liveNav.locator(`a.${itemClassByPanel[panel]}`);
    await expect(link).toBeVisible();
    await link.click();
    await expect(link).toHaveClass(/active/);
  }

  private livePanelCard(heading: RegExp) {
    return this.page
      .locator('.card')
      .filter({ has: this.page.locator(':scope > .card-header').getByRole('heading', { name: heading }) })
      .first();
  }

  async expectActivitiesFeedPanel() {
    await this.goToPanel('Activities');
    await expect(this.page.getByRole('heading', { name: /Real-time Activity Feed/i })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Search activities/i)).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Refresh/i })).toBeVisible();
  }

  async expectInboxPanel() {
    await this.goToPanel('Inbox');
    await expect(this.page.getByRole('heading', { name: /Inbox/i })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Search subject, sender, snippet/i)).toBeVisible();
  }

  async expectSmsPanel() {
    await this.goToPanel('SMS');
    await expect(this.page.getByRole('heading', { name: /SMS/i })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Search from, to, message, response/i)).toBeVisible();
  }

  async expectCallsPanel() {
    await this.goToPanel('Calls');
    await expect(this.page.getByRole('heading', { name: /Calls/i })).toBeVisible();
    await expect(this.page.getByPlaceholder(/Search call sid, from, to, assistant/i)).toBeVisible();
  }

  async expectCommunicationQaPanel() {
    await this.goToPanel('QA');
    await expect(this.page.getByRole('heading', { name: /Communication QA/i })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Review Queue/i })).toBeVisible();
  }

  async expectEscalationTasksPanel() {
    await this.goToPanel('Escalations');
    await expect(this.page.getByRole('heading', { name: /Escalation Tasks/i })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Add Task/i })).toBeVisible();
  }

  async openAddEscalationTaskEditor() {
    await this.page.getByRole('button', { name: /Add Task/i }).click();
    await expect(this.page.getByRole('heading', { name: /Add Escalation Task/i })).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Save Task/i })).toBeVisible();
  }

  async createEscalationTask(options: { team: string; taskName: string; description?: string }) {
    await this.openAddEscalationTaskEditor();

    await this.page.getByPlaceholder(/e\.g\., Support, Sales, Engineering/i).fill(options.team);
    await expect(this.page.getByPlaceholder(/e\.g\., Support, Sales, Engineering/i)).toHaveValue(options.team);

    await this.page.getByPlaceholder(/Brief task name/i).fill(options.taskName);
    await expect(this.page.getByPlaceholder(/Brief task name/i)).toHaveValue(options.taskName);

    if (options.description) {
      await this.page.getByPlaceholder(/Detailed description of the escalation/i).fill(options.description);
    }

    const saveResponse = this.page.waitForResponse(
      (response) =>
        /\/aegis\/virtual-assistant\/escalation-tasks\/?$/.test(response.url()) &&
        response.request().method() === 'POST' &&
        response.status() === 201,
      { timeout: 30000 }
    );

    const saveButton = this.page.getByRole('button', { name: /Save Task/i });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();
    await saveResponse;

    await expect(this.page.getByRole('row').filter({ hasText: options.taskName }).first()).toBeVisible({
      timeout: 15000
    });
  }

  async expectEscalationTaskInList(taskName: string) {
    await this.goto();
    await this.expectEscalationTasksPanel();
    await expect(this.page.getByRole('row').filter({ hasText: taskName }).first()).toBeVisible({
      timeout: 15000
    });
  }

  async deleteEscalationTask(taskName: string) {
    await this.goto();
    await this.expectEscalationTasksPanel();
    await deleteRowByName(this.page, taskName, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
    });
  }

  async expectContinualImprovementPanel() {
    await this.goToPanel('Continual Improvement');
    await expect(this.page.getByRole('heading', { name: /Continual Improvement/i })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Performance Trends/i })).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /Improvement Suggestions/i })).toBeVisible();
  }

  async expectAssistantsTodoListPanel() {
    await this.goToPanel('Assistants Todo List');
    const panel = this.livePanelCard(/Assistants Todo List/i);
    await expect(panel.getByRole('heading', { name: /Assistants Todo List/i })).toBeVisible();
    await expect(panel.getByRole('button', { name: /Refresh/i })).toBeVisible();
    await expect(panel.getByPlaceholder(/^Search/i)).toBeVisible();
    await expect(
      panel.locator('select').filter({ has: this.page.locator('option', { hasText: /^All Activity Types$/i }) })
    ).toBeVisible();
    await expect(
      panel.locator('select').filter({ has: this.page.locator('option', { hasText: /^All Statuses$/i }) })
    ).toBeVisible();
    await expect(panel.getByRole('columnheader', { name: /Activity Name/i })).toBeVisible();
  }

  async expectFormSubmissionsPanel() {
    await this.goToPanel('Form Submissions');
    const panel = this.livePanelCard(/Form Submissions/i);
    await expect(panel.getByRole('heading', { name: /Form Submissions/i })).toBeVisible();
    await expect(panel.getByRole('button', { name: /Refresh/i })).toBeVisible();
    await expect(panel.getByPlaceholder(/^Search/i)).toBeVisible();
    await expect(
      panel.locator('select').filter({ has: this.page.locator('option', { hasText: /^All Forms$/i }) })
    ).toBeVisible();
    await expect(
      panel.locator('select').filter({ has: this.page.locator('option', { hasText: /^All Sources$/i }) })
    ).toBeVisible();
    await expect(panel.getByRole('columnheader', { name: /^Form$/i })).toBeVisible();
  }

  /** Shell-only: nav + each required monitoring panel heading/controls. No live message content. */
  async expectMonitoringPanelsShell() {
    await this.expectMonitoringNav();
    await this.expectActivitiesFeedPanel();
    await this.expectInboxPanel();
    await this.expectSmsPanel();
    await this.expectCallsPanel();
    await this.expectCommunicationQaPanel();
    await this.expectEscalationTasksPanel();
  }

  /** Shell-only: remaining Live Data panels beyond PW-028 monitoring coverage. No row/detail content. */
  async expectRemainingPanelsShell() {
    await this.expectContinualImprovementPanel();
    await this.expectAssistantsTodoListPanel();
    await this.expectFormSubmissionsPanel();
  }

  private detailCandidates: Array<{
    panel: 'Activities' | 'Escalations' | 'Assistants Todo List' | 'Form Submissions';
    tableHeader: RegExp;
    detailTitle: RegExp;
    kind: 'side-drawer' | 'app-drawer' | 'inline';
  }> = [
    {
      panel: 'Activities',
      tableHeader: /^Agent$/i,
      detailTitle: /Activity Details/i,
      kind: 'side-drawer'
    },
    {
      panel: 'Escalations',
      tableHeader: /Task Name/i,
      detailTitle: /Escalation Task Details/i,
      kind: 'app-drawer'
    },
    {
      panel: 'Assistants Todo List',
      tableHeader: /Activity Name/i,
      detailTitle: /Todo Details/i,
      kind: 'app-drawer'
    },
    {
      panel: 'Form Submissions',
      tableHeader: /^Form$/i,
      detailTitle: /Submission Details/i,
      kind: 'inline'
    }
  ];

  private panelTable(tableHeader: RegExp) {
    return this.page.locator('table').filter({ has: this.page.getByRole('columnheader', { name: tableHeader }) }).first();
  }

  /**
   * Opens the first available Live Data detail view.
   * Returns null when no candidate panel has a View Details row (caller should skip).
   */
  async openFirstAvailableDetailDrawer(): Promise<{
    panel: 'Activities' | 'Escalations' | 'Assistants Todo List' | 'Form Submissions';
    kind: 'side-drawer' | 'app-drawer' | 'inline';
    detailTitle: RegExp;
  } | null> {
    for (const candidate of this.detailCandidates) {
      await this.goToPanel(candidate.panel);
      const table = this.panelTable(candidate.tableHeader);
      const viewDetails = table.locator('tbody tr').locator('button[title="View Details"], button:has(.fa-eye)').first();
      if (!(await viewDetails.isVisible({ timeout: 3000 }).catch(() => false))) {
        continue;
      }

      await viewDetails.click();

      if (candidate.kind === 'side-drawer') {
        const drawer = this.page.locator('.side-drawer.open');
        await expect(drawer).toBeVisible({ timeout: 10000 });
        await expect(drawer.getByText(candidate.detailTitle).first()).toBeVisible();
      } else if (candidate.kind === 'app-drawer') {
        await expect(this.page.locator('.drawer-heading').filter({ hasText: candidate.detailTitle })).toBeVisible({
          timeout: 10000
        });
      } else {
        await expect(this.page.getByText(candidate.detailTitle).first()).toBeVisible({ timeout: 10000 });
        await expect(this.page.getByRole('button', { name: /Back to List/i })).toBeVisible();
      }

      return {
        panel: candidate.panel,
        kind: candidate.kind,
        detailTitle: candidate.detailTitle
      };
    }

    return null;
  }

  async expectDetailDrawerShell(opened: {
    kind: 'side-drawer' | 'app-drawer' | 'inline';
    detailTitle: RegExp;
  }) {
    if (opened.kind === 'side-drawer') {
      const drawer = this.page.locator('.side-drawer.open');
      await expect(drawer).toBeVisible();
      await expect(drawer.getByText(opened.detailTitle).first()).toBeVisible();
      await expect(drawer.locator('.side-drawer-header button')).toBeVisible();
      return;
    }

    if (opened.kind === 'app-drawer') {
      await expect(this.page.locator('.drawer-heading').filter({ hasText: opened.detailTitle })).toBeVisible();
      await expect(this.page.locator('.app-drawer-wrapper .drawer-nav-btn button.hamburger')).toBeVisible();
      return;
    }

    await expect(this.page.getByText(opened.detailTitle).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Back to List/i })).toBeVisible();
  }

  async closeDetailDrawer(opened: { kind: 'side-drawer' | 'app-drawer' | 'inline'; detailTitle: RegExp }) {
    if (opened.kind === 'side-drawer') {
      const drawer = this.page.locator('.side-drawer.open');
      await drawer.locator('.side-drawer-header button').click();
      await expect(drawer).toBeHidden({ timeout: 10000 });
      return;
    }

    if (opened.kind === 'app-drawer') {
      await this.page.locator('.app-drawer-wrapper .drawer-nav-btn button.hamburger.is-active').click();
      await expect(this.page.locator('.drawer-heading').filter({ hasText: opened.detailTitle })).toBeHidden({
        timeout: 10000
      });
      return;
    }

    await this.page.getByRole('button', { name: /Back to List/i }).click();
    await expect(this.page.getByText(opened.detailTitle).first()).toBeHidden({ timeout: 10000 });
  }
}

export class VirtualAssistantRealtimePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/virtual-assistant-realtime');
    await this.page.waitForURL(/\/virtual-assistant-realtime/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectRealtimePage() {
    await expect(this.page).toHaveURL(/\/virtual-assistant-realtime/);
    await expect(this.page.getByText(/Virtual Assistant Realtime/i).first()).toBeVisible();
    await expect(this.page.getByRole('heading', { name: /^Realtime$/i }).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /Assistants/i }).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /Live Data/i }).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Refresh/i })).toBeVisible();
    await expect(this.page.getByRole('combobox').nth(0)).toBeVisible();
    await expect(this.page.getByRole('combobox').nth(1)).toBeVisible();
    await expect(this.page.getByText(/Webhook:/i)).toBeVisible();
  }
}
