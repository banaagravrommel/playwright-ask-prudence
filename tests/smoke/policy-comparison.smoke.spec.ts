import { test } from '@playwright/test';
import { PolicyComparisonPage } from '../page-objects/policy-comparison-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Policy Comparison smoke @smoke', () => {
  test('creates a draft session via create session and cleans up', async ({ page }) => {
    test.setTimeout(120000);

    const comparisonName = smokeLabel('policy-comparison');
    const policyPage = new PolicyComparisonPage(page);

    try {
      await policyPage.goto();
      await policyPage.startComparisonSession('Demo', comparisonName);
      await policyPage.expectSessionInList(comparisonName);
    } finally {
      await policyPage.deleteSession(comparisonName);
    }
  });
});
