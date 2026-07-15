import { expect, type Locator, type Page } from '@playwright/test';

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
    await expect(this.page.getByText('Virtual Assistants').first()).toBeVisible();
    await expect(this.page.getByText(/Manage your AI Virtual Assistants/i)).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Assistants', exact: true })).toBeVisible();
    await expect(this.newAssistantButton).toBeVisible();
    await expect(this.assistantsTable).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Assistant' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Personality' })).toBeVisible();
    await expect(this.page.getByRole('columnheader', { name: 'Status' })).toBeVisible();
  }

  async openNewAssistantEditor() {
    await expect(this.newAssistantButton).toBeEnabled();
    await this.newAssistantButton.click();
    await expect(this.page.getByRole('button', { name: /Save Assistant/i })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('tab', { name: 'Details' })).toBeVisible();
    await expect(this.page.getByRole('textbox', { name: /Enter assistant name/i })).toBeVisible();
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

  async openFirstActiveAssistant() {
    const row = this.page.getByRole('row').filter({ hasText: /active/i }).first();
    await row.click();
    await expect(this.page.getByRole('button', { name: /Save Assistant/i })).toBeVisible({ timeout: 15000 });
    await expect(this.page.getByRole('textbox', { name: /Enter assistant name/i })).toBeVisible();
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
      await expect(this.workbench.getByText('documents', { exact: true }).first()).toBeVisible();
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

    const askButton = this.page.getByRole('button', { name: 'Ask' });
    await expect(askButton).toBeEnabled();
    await askButton.click();
  }

  async expectChatResponse() {
    await expect(this.page.locator('body')).toContainText(
      /general liability|insurance|coverage|liability|policy/i,
      { timeout: 180000 }
    );
  }

  async expectPageShell() {
    await expect(this.page).toHaveURL(/\/virtual-assistant\/ask-prudens/);
    await expect(this.page.getByText(/Ask Prudens\s+AI Workbench/).first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /Back/i })).toBeVisible();
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
    await expect(this.page.getByText('Virtual Assistant Settings').first()).toBeVisible();
    await expect(this.page.getByText(/Configure data capture, forms, tools, and other settings/i)).toBeVisible();
    await expect(this.page.getByRole('link', { name: /Assistants/i }).first()).toBeVisible();
    await expect(this.page.getByRole('link', { name: /Live Data/i }).first()).toBeVisible();
    await expect(this.page.getByRole('heading', { name: 'Settings', exact: true })).toBeVisible();
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
