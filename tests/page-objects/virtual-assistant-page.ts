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
    await expect(this.page.getByPlaceholder(/Enter form name/i)).toBeVisible();
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

  async deleteKnowledgeBase(name: string) {
    await this.goto();
    await this.expectKnowledgeBasesSection();
    await deleteRowByName(this.page, name, {
      deleteButton: (row) => row.locator('button[title="Delete"]').first()
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

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto('/virtual-assistant-live');
    await this.page.waitForURL(/\/virtual-assistant-live/);
    await this.page.waitForLoadState('networkidle');
  }

  async expectLiveDataPage() {
    await expect(this.page).toHaveURL(/\/virtual-assistant-live/);
    await expect(this.page.getByRole('heading', { name: /Live Data/i }).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /Assistants/i }).first()).toBeVisible();
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
