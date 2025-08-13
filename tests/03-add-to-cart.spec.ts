import { test, expect } from '@playwright/test';
import { POSTestUtils } from './pos-test-utils';

/**
 * Test 3: Add to Cart functionality
 * Assumes login and search work (tested in previous tests)
 */
test('Add Products to Cart Test', async ({ page }) => {
  const pos = new POSTestUtils(page);
  
  // Setup, login, and search (reusing working functionality)
  await pos.setupPage();
  const loginSuccess = await pos.login();
  expect(loginSuccess).toBe(true);
  
  const searchSuccess = await pos.searchProducts('EG ');
  expect(searchSuccess).toBe(true);
  
  // Test adding products to cart
  console.log('🛒 Testing add to cart functionality...');
  
  // Try to add the first product
  const addSuccess1 = await pos.addProductToCart(0);
  expect(addSuccess1).toBe(true);
  
  await pos.takeDebugScreenshot('after-first-add');
  
  // Search again for a second product
  await pos.searchProducts('EG ');
  
  // Try to add the second product
  const addSuccess2 = await pos.addProductToCart(1);
  expect(addSuccess2).toBe(true);
  
  await pos.takeDebugScreenshot('after-second-add');
  
  console.log('✅ Add to cart test completed');
});
