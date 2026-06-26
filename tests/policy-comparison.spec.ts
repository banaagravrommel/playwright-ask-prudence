import { test } from '@playwright/test';
import { PolicyComparisonPage } from './page-objects/policy-comparison-page';

test.describe('Prudens policy comparison', () => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = `${timestamp}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const accountName = `QA Automation ${randomSuffix}`;
  const comparisonName = `QA Automation ${randomSuffix}`;

  test('creates policy comparison with two uploaded documents', async ({ page }) => {
    const policyComparisonPage = new PolicyComparisonPage(page);
    await policyComparisonPage.goto();
    await policyComparisonPage.createAccount(accountName);
    await policyComparisonPage.fillComparisonName(comparisonName);
    await policyComparisonPage.uploadDocuments([
      'tests/documents/sample1.pdf',
      'tests/documents/sample2.pdf'
    ]);
    await policyComparisonPage.verifyDocumentCount(2);
    await policyComparisonPage.save();

    console.log(`Created policy comparison account: ${accountName}`);
    console.log(`Created policy comparison name: ${comparisonName}`);
  });
});
