import { test, expect } from '@playwright/test';
import { POSTestUtils } from './pos-test-utils';

/**
 * Test 5: Complete E2E Workflow
 * Only run this after individual components are working
 * This combines all the tested functionality
 */
test('Complete POS Workflow', async ({ page }) => {
  const pos = new POSTestUtils(page);
  
  console.log('🚀 Starting complete E2E workflow test...');
  
  // 1. Setup and Login
  await pos.setupPage();
  const loginSuccess = await pos.login();
  expect(loginSuccess).toBe(true);
  console.log('✅ Step 1: Login completed');
  
  // 2. Search for first product
  const searchSuccess1 = await pos.searchProducts('EG ');
  expect(searchSuccess1).toBe(true);
  console.log('✅ Step 2: First search completed');
  
  // 3. Add first product to cart
  const addSuccess1 = await pos.addProductToCart(1); // Second item from list
  expect(addSuccess1).toBe(true);
  console.log('✅ Step 3: First product added');
  
  // 4. Search for second product
  const searchSuccess2 = await pos.searchProducts('EG ');
  expect(searchSuccess2).toBe(true);
  console.log('✅ Step 4: Second search completed');
  
  // 5. Add second product to cart
  const addSuccess2 = await pos.addProductToCart(2); // Third item from list
  expect(addSuccess2).toBe(true);
  console.log('✅ Step 5: Second product added');
  
  // 6. Navigate to payment
  const paymentNavSuccess = await pos.goToPayment();
  expect(paymentNavSuccess).toBe(true);
  console.log('✅ Step 6: Payment navigation completed');
  
  // 7. Complete payment
  const paymentSuccess = await pos.completePayment();
  expect(paymentSuccess).toBe(true);
  console.log('✅ Step 7: Payment completed');
  
  await pos.takeDebugScreenshot('workflow-completed');
  console.log('🎉 Complete E2E workflow test passed!');
});
