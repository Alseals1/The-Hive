import { test } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } }); // Mobile-first

test('Check console errors', async ({ page }) => {
  let errors = [];
  let warnings = [];
  
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[${msg.type().toUpperCase()}] ${text}`);
    if (msg.type() === 'error') errors.push(text);
    if (msg.type() === 'warn') warnings.push(text);
  });

  page.on('request', request => {
    console.log(`→ ${request.method()} ${request.url()}`);
  });

  page.on('response', response => {
    console.log(`← ${response.status()} ${response.url()}`);
  });

  await page.goto('http://localhost:5173/');
  await page.waitForLoadState('networkidle').catch(() => {});

  await page.locator('a:has-text("SIGN UP")').click();
  await page.waitForLoadState('networkidle').catch(() => {});

  await page.locator('button:has-text("COACH")').click();
  await page.locator('input[placeholder="Alex Johnson"]').fill('Test User');
  await page.locator('input[type="email"]').fill('test@example.com');
  await page.locator('input[placeholder*="Minimum"]').fill('password123');
  
  console.log('\n🔄 Submitting signup form...');
  await page.locator('button:has-text("CREATE ACCOUNT")').click();
  
  // Wait a bit to see what happens
  await page.waitForTimeout(3000);
  
  console.log(`\n⚠️ Errors detected: ${errors.length}`);
  console.log(`⚠️ Warnings detected: ${warnings.length}`);

  await page.screenshot({ path: '/tmp/10-console-check.png' });
});
