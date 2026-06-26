import { test, expect } from '@playwright/test';
import { PolicyComparisonPage } from '../page-objects/policy-comparison-page';
import { smokeLabel } from '../helpers/smoke-data';
import { SMOKE_DOCUMENTS } from '../helpers/test-documents';

test.describe('Policy Comparison AI smoke @smoke-ai', () => {
  test('uploads documents, saves, and generates comparison results', async ({ page }) => {
    test.setTimeout(600000);

    const comparisonName = smokeLabel('policy-comparison');
    const policyPage = new PolicyComparisonPage(page);

    await policyPage.goto();
    await policyPage.startComparisonSession('Demo', comparisonName, [...SMOKE_DOCUMENTS]);
    await policyPage.generateComparison();
    await policyPage.expectComparisonResults();
  });
});
