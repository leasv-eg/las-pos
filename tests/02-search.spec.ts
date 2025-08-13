import { test, expect } from '@playwright/test';
import { POSTestUtils } from './pos-test-utils';

/**
 * Test 2: Search functionality
 * Assumes login works (tested in 01-login.spec.ts)
 */
test('Search Products Test', async ({ page }) => {
  const pos = new POSTestUtils(page);
  
  // Setup and login (reusing working functionality)
  await pos.setupPage();
  const loginSuccess = await pos.login();
  expect(loginSuccess).toBe(true);
  
  // Test search - this is exactly what works in other tests
  const searchSuccess = await pos.searchProducts('EG ');
  expect(searchSuccess).toBe(true);
  
  // Just verify that search returns true (which means it found results)
  // This is consistent with how the other tests work
  console.log('✅ Search functionality verified');
  
  await pos.takeDebugScreenshot('search-results');
  console.log('✅ Search test completed');
});
