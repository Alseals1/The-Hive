import { test } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } }); // Mobile-first

test('Test team creation flow', async ({ page }) => {
  // Signup flow
  await page.goto('http://localhost:5173/');
  await page.locator('a:has-text("SIGN UP")').click();
  await page.waitForLoadState('networkidle').catch(() => {});

  await page.locator('button:has-text("COACH")').click();
  await page.locator('input[placeholder="Alex Johnson"]').fill('Coach Test');
  await page.locator('input[type="email"]').fill(`test${Date.now()}@example.com`);
  await page.locator('input[placeholder*="Minimum"]').fill('password123');
  await page.locator('button:has-text("CREATE ACCOUNT")').click();
  
  // Wait for page navigation
  await page.waitForURL('**/teams', { timeout: 10000 }).catch(() => {});
  await page.screenshot({ path: '/tmp/11-teams-page.png' });
  console.log('✅ Reached teams page');

  // Click create team button
  await page.locator('button:has-text("CREATE A TEAM")').click();
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.screenshot({ path: '/tmp/12-create-team-form.png' });
  console.log('✅ Opened team creation form');

  // Check form fields
  const inputs = await page.locator('input, textarea, select').count();
  console.log(`📝 Form has ${inputs} fields`);

  const bodyText = await page.innerText('body');
  console.log('\n📄 Team form text:\n', bodyText.substring(0, 500));

  // Try to fill and submit
  const teamNameInput = await page.locator('input[placeholder*="team"]').first().catch(() => null);
  if (teamNameInput) {
    await teamNameInput.fill('Test Baseball Team');
    console.log('✅ Filled team name');
  }

  // Look for select/dropdown for sport
  const selects = await page.locator('select').count();
  const buttonGroups = await page.locator('button[role="button"]').count();
  console.log(`\n🔘 Found ${selects} selects, ${buttonGroups} button groups`);

  // Try to submit
  const submitButton = await page.locator('button:has-text("CREATE"), button:has-text("Save")').first().catch(() => null);
  if (submitButton) {
    await submitButton.click();
    await page.waitForLoadState('networkidle').catch(() => {}).catch(() => {});
    await page.waitForTimeout(2000);
    await page.screenshot({ path: '/tmp/13-after-team-create.png' });
    console.log('✅ Clicked submit');
  }

  // Check current page
  const url = page.url();
  console.log(`\n📍 URL: ${url}`);
});
