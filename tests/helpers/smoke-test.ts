import { test as base, expect } from '@playwright/test';

export type CleanupFn = () => Promise<void> | void;

type SmokeFixtures = {
  /**
   * Register teardown that runs after the test (LIFO), even on failure.
   * Prefer this over inline try/finally for data-creating smokes.
   */
  trackCleanup: (fn: CleanupFn) => void;
};

/**
 * Playwright test extended with `trackCleanup` for standardized smoke teardown.
 * Import `{ test, expect }` from this module in create-path smoke specs.
 */
export const test = base.extend<SmokeFixtures>({
  trackCleanup: async ({}, use, testInfo) => {
    const cleanups: CleanupFn[] = [];

    await use((fn) => {
      cleanups.push(fn);
    });

    const errors: unknown[] = [];
    for (const fn of [...cleanups].reverse()) {
      try {
        await fn();
      } catch (error) {
        errors.push(error);
        console.warn(`[smoke teardown] ${testInfo.titlePath.join(' › ')}:`, error);
      }
    }

    if (errors.length === 1) {
      throw errors[0];
    }
    if (errors.length > 1) {
      throw new Error(
        `${errors.length} smoke cleanup steps failed. First: ${
          errors[0] instanceof Error ? errors[0].message : String(errors[0])
        }`
      );
    }
  }
});

export { expect };
