import { test, expect } from '@playwright/test';
import { POSTestUtils } from './pos-test-utils';

/**
 * Test 1: Login functionality
 * This test only focuses on login and should pass consistently
 */
test('Login Test', async ({ page }) => {
  const pos = new POSTestUtils(page);
  
  // Setup
  await pos.setupPage();
  
  // Test login
  const loginSuccess = await pos.login();
  expect(loginSuccess).toBe(true);
  
  // Take screenshot for verification
  await pos.takeDebugScreenshot('login-success');
});
