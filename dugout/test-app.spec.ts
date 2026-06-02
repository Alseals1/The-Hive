import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } }); // Mobile-first

test('Explore Dugout app', async ({ page }) => {
  // Test 1: Load landing page
  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({ path: '/tmp/01-landing.png' });
  console.log('✅ Landing page loaded');

  // Test 2: Check what's visible
  const bodyText = await page.innerText('body');
  console.log('\n📄 Landing page text:\n', bodyText.substring(0, 400));

  // Test 3: Find buttons and links
  const buttons = await page.locator('button').count();
  const links = await page.locator('a').count();
  const inputs = await page.locator('input').count();
  console.log(`\n🔘 UI Elements: ${buttons} buttons, ${links} links, ${inputs} inputs`);

  // Test 4: Look for auth UI
  const emailInputs = await page.locator('input[type="email"]').count();
  const passwordInputs = await page.locator('input[type="password"]').count();
  console.log(`🔐 Auth fields: ${emailInputs} email, ${passwordInputs} password`);

  // Test 5: Try to find navigation
  const navItems = await page.locator('nav, [role="navigation"]').count();
  console.log(`🧭 Navigation elements: ${navItems}`);

  // Test 6: Check for errors in console
  let consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Test 7: Look for empty states or loading indicators
  const loadingIndicators = await page.locator('[class*="loading"], [class*="spinner"], [class*="skeleton"]').count();
  console.log(`⏳ Loading indicators found: ${loadingIndicators}`);

  // Test 8: Check viewport size
  const viewport = page.viewportSize();
  console.log(`📱 Viewport: ${viewport?.width}x${viewport?.height}`);

  // Test 9: Try clicking buttons
  const allButtons = await page.locator('button').all();
  if (allButtons.length > 0) {
    console.log(`\n🖱️ Found ${allButtons.length} buttons, clicking first button...`);
    try {
      await allButtons[0].click();
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.screenshot({ path: '/tmp/02-after-click.png' });
      console.log('✅ Button clicked successfully');
    } catch (e) {
      console.log('⚠️ Error clicking button:', e);
    }
  }
});
