import { expect, type Page } from '@playwright/test';

type AccessibleName = string | RegExp;

export interface PageBaseline {
  url?: RegExp;
  headings?: AccessibleName[];
  buttons?: AccessibleName[];
  textboxes?: AccessibleName[];
  columnHeaders?: AccessibleName[];
  visibleText?: AccessibleName[];
}

export async function expectPageBaseline(page: Page, baseline: PageBaseline) {
  if (baseline.url) {
    await expect(page).toHaveURL(baseline.url);
  }

  for (const heading of baseline.headings ?? []) {
    await expect(page.getByRole('heading', { name: heading }).first()).toBeVisible();
  }

  for (const button of baseline.buttons ?? []) {
    await expect(page.getByRole('button', { name: button }).first()).toBeVisible();
  }

  for (const textbox of baseline.textboxes ?? []) {
    await expect(page.getByRole('textbox', { name: textbox }).first()).toBeVisible();
  }

  for (const columnHeader of baseline.columnHeaders ?? []) {
    await expect(page.getByRole('columnheader', { name: columnHeader }).first()).toBeVisible();
  }

  for (const text of baseline.visibleText ?? []) {
    await expect(page.getByText(text).first()).toBeVisible();
  }
}
