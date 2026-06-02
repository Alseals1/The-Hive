import { test } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } }); // Mobile-first

test('Test complete user flow', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle').catch(() => {});

  // Test signup flow
  console.log('\n📋 Testing signup flow');
  await page.locator('a:has-text("SIGN UP")').click();
  await page.waitForLoadState('networkidle').catch(() => {});

  // Select Coach role
  await page.locator('button:has-text("COACH / ADMIN")').click();
  await page.screenshot({ path: '/tmp/07-coach-selected.png' });
  console.log('✅ Selected coach role');

  // Fill in form
  await page.locator('input[placeholder="Alex Johnson"]').fill('John Coach');
  await page.locator('input[type="email"]').fill('coach@example.com');
  await page.locator('input[placeholder*="Minimum"]').fill('password123');
  await page.screenshot({ path: '/tmp/08-filled-form.png' });
  console.log('✅ Filled signup form');

  // Try to submit
  await page.locator('button:has-text("CREATE ACCOUNT")').click();
  await page.waitForLoadState('networkidle').catch(() => {}).catch(() => {});
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/tmp/09-after-signup.png' });
  console.log('✅ Clicked create account');

  // Check current URL
  const url = page.url();
  console.log(`📍 Current URL: ${url}`);

  // Check what's visible
  const bodyText = await page.innerText('body').catch(() => 'N/A');
  console.log('\n📄 Page content:', bodyText.substring(0, 400));

  // Test 2: Look for buttons/actions available
  const buttons = await page.locator('button').allTextContents();
  console.log(`🔘 Available buttons: ${buttons.join(', ')}`);

  const links = await page.locator('a').allTextContents();
  console.log(`🔗 Available links: ${links.join(', ')}`);

  // Test 3: Check for navigation
  const navText = await page.locator('nav, [role="navigation"]').innerText().catch(() => 'No nav');
  console.log(`🧭 Navigation: ${navText}`);

  // Test 4: Mobile responsiveness - check if page is readable
  const viewport = page.viewportSize();
  console.log(`\n📱 Testing on ${viewport?.width}x${viewport?.height}`);
});
