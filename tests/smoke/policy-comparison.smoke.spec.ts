import { test } from '../helpers/smoke-test';
import { PolicyComparisonPage } from '../page-objects/policy-comparison-page';
import { smokeLabel } from '../helpers/smoke-data';

test.describe('Policy Comparison smoke @smoke', () => {
  test('creates a draft session via create session and cleans up', async ({ page, trackCleanup }) => {
    test.setTimeout(120000);

    const comparisonName = smokeLabel('policy-comparison');
    const policyPage = new PolicyComparisonPage(page);
    trackCleanup(async () => {
      await policyPage.deleteSession(comparisonName);
    });

    await policyPage.goto();
    await policyPage.startComparisonSession('Demo', comparisonName);
    await policyPage.expectSessionInList(comparisonName);
  });
});
