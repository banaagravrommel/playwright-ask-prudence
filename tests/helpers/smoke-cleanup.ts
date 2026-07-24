import { expect, type Locator, type Page } from '@playwright/test';

/**
 * Click an action that may open a native confirm(), SweetAlert2, or in-page dialog.
 */
export async function confirmDestructiveAction(page: Page, action: () => Promise<void>) {
  page.once('dialog', async (dialog) => {
    await dialog.accept();
  });

  await action();

  const swalContainer = page.locator('.swal2-container');
  if (await swalContainer.isVisible({ timeout: 3000 }).catch(() => false)) {
    // Confirm delete, then dismiss optional success OK.
    for (let step = 0; step < 2; step++) {
      const confirmButton = page.locator('button.swal2-confirm');
      if (!(await confirmButton.isVisible({ timeout: 5000 }).catch(() => false))) {
        break;
      }
      await confirmButton.click();
      await page.waitForTimeout(300);
    }
    await expect(swalContainer).toBeHidden({ timeout: 15000 });
    return;
  }

  const confirmDialog = page.getByRole('dialog').filter({ hasText: /are you sure|want to delete/i });
  if (await confirmDialog.first().isVisible().catch(() => false)) {
    await confirmDialog.first().getByRole('button', { name: /yes|delete|ok|confirm/i }).click();
    await expect(confirmDialog.first()).toBeHidden({ timeout: 15000 });
  }
}

export function rowByName(page: Page, name: string): Locator {
  return page.getByRole('row').filter({ hasText: name }).first();
}

export async function deleteRowByName(
  page: Page,
  name: string,
  options: {
    deleteButton?: (row: Locator) => Locator;
    afterDelete?: () => Promise<void>;
  } = {}
) {
  const row = rowByName(page, name);
  await expect(row).toBeVisible({ timeout: 15000 });

  const deleteButton =
    options.deleteButton?.(row) ??
    row.locator('button[title*="Delete" i], button[aria-label*="Delete" i], button:has(.fa-trash)').first();

  await confirmDestructiveAction(page, async () => {
    await deleteButton.click();
  });

  if (options.afterDelete) {
    await options.afterDelete();
  }

  await expect(page.getByRole('row').filter({ hasText: name })).toHaveCount(0, { timeout: 15000 });
}
