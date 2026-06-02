import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } }); // Mobile-first

test('Test form validation and signup', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle').catch(() => {});

  // Test 1: Try to sign in with empty fields
  console.log('\n📋 Test 1: Empty form submission');
  await page.locator('button:has-text("SIGN IN")').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: '/tmp/03-empty-form-submit.png' });
  console.log('✅ Submitted empty form');

  // Test 2: Click signup link
  console.log('\n📋 Test 2: Navigate to signup');
  await page.locator('a:has-text("SIGN UP")').click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({ path: '/tmp/04-signup-page.png' });
  console.log('✅ Navigated to signup');

  // Test 3: Check signup form
  const signupText = await page.innerText('body').catch(() => '');
  console.log('\n📄 Signup page content:', signupText.substring(0, 300));

  // Test 4: Look for form fields on signup
  const inputs = await page.locator('input').count();
  console.log(`🔘 Signup form inputs: ${inputs}`);

  // Test 5: Try empty signup
  const signupButtons = await page.locator('button').count();
  if (signupButtons > 0) {
    await page.locator('button').first().click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: '/tmp/05-signup-empty.png' });
    console.log('✅ Submitted empty signup form');
  }

  // Test 6: Go back and test email input
  console.log('\n📋 Test 3: Input validation');
  await page.locator('a:has-text("SIGN IN")').click();
  await page.waitForLoadState('networkidle').catch(() => {});
  
  // Fill email with invalid format
  await page.locator('input[type="email"]').fill('notanemail');
  await page.screenshot({ path: '/tmp/06-invalid-email.png' });
  console.log('✅ Filled invalid email');

  // Test 7: Check placeholder text visibility
  await page.locator('input[type="email"]').clear();
  const placeholders = await page.locator('input').evaluateAll(inputs =>
    inputs.map(i => (i as HTMLInputElement).placeholder)
  );
  console.log('\n📝 Input placeholders:', placeholders);

  // Test 8: Mobile touch target sizes
  const signInButton = await page.locator('button:has-text("SIGN IN")');
  const box = await signInButton.boundingBox();
  if (box) {
    console.log(`\n📱 Sign in button size: ${box.width}x${box.height}px`);
    if (box.height < 44) {
      console.log('⚠️ Button height < 44px (iOS minimum touch target)');
    }
  }

  // Test 9: Check spacing and readability
  const emailInput = await page.locator('input[type="email"]');
  const box2 = await emailInput.boundingBox();
  if (box2) {
    console.log(`📱 Email input height: ${box2.height}px`);
  }
});
