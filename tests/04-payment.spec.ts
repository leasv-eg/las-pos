import { test, expect } from '@playwright/test';
import { POSTestUtils } from './pos-test-utils';

/**
 * Test 4: Payment functionality
 * Assumes login, search, and add to cart work (tested in previous tests)
 */
test('Payment Process Test', async ({ page }) => {
  const pos = new POSTestUtils(page);
  
  // Setup, login, search, and add items (reusing working functionality)
  await pos.setupPage();
  const loginSuccess = await pos.login();
  expect(loginSuccess).toBe(true);
  
  const searchSuccess = await pos.searchProducts('EG ');
  expect(searchSuccess).toBe(true);
  
  const addSuccess = await pos.addProductToCart(0);
  expect(addSuccess).toBe(true);
  
  // Test payment process
  console.log('💳 Testing payment functionality...');
  
  const paymentNavSuccess = await pos.goToPayment();
  expect(paymentNavSuccess).toBe(true);
  
  await pos.takeDebugScreenshot('payment-screen');
  
  const paymentSuccess = await pos.completePayment();
  expect(paymentSuccess).toBe(true);
  
  await pos.takeDebugScreenshot('payment-completed');
  
  console.log('✅ Payment test completed');
});
