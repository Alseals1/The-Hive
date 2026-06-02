import { test } from '@playwright/test';

test('Test overall UX and edge cases', async ({ page }) => {
  test.use({ viewport: { width: 375, height: 812 } }); // Mobile
  
  console.log('\n🧪 COMPREHENSIVE UX TEST');
  
  await page.goto('http://localhost:5173/');
  
  // Test 1: Form elements analysis
  console.log('\n1️⃣ Form structure...');
  const emailInput = page.locator('input[type="email"]');
  const hasLabel = await page.locator('label').count() > 0;
  console.log(`✓ Form has labels: ${hasLabel}`);
  
  // Check accessibility attributes
  const inputAccessibility = await emailInput.evaluate(el => ({
    ariaLabel: el.getAttribute('aria-label'),
    ariaRequired: el.getAttribute('aria-required'),
    required: (el as HTMLInputElement).required
  })).catch(() => null);
  console.log('✓ Email input accessibility:', inputAccessibility);
  
  // Test 2: Visual hierarchy
  console.log('\n2️⃣ Checking visual hierarchy...');
  const elements = await page.locator('h1, h2, h3, p, button').evaluateAll(els =>
    els.map((e: any) => ({
      tag: e.tagName,
      text: e.textContent?.substring(0, 30),
      fontSize: window.getComputedStyle(e).fontSize
    }))
  );
  const uniqueSizes = [...new Set(elements.map(e => e.fontSize))];
  console.log(`✓ Font sizes used: ${uniqueSizes.join(', ')}`);
  
  // Test 3: Spacing
  console.log('\n3️⃣ Checking spacing (margin/padding)...');
  const button = page.locator('button').first();
  const margin = await button.evaluate(el => 
    window.getComputedStyle(el).margin
  );
  console.log(`✓ Button margin: ${margin}`);
  
  // Test 4: Check for common UX issues
  console.log('\n4️⃣ UX quality checks...');
  
  const hasPlaceholders = await page.locator('input[placeholder]').count() > 0;
  console.log(`✓ Inputs use placeholders: ${hasPlaceholders}`);
  
  const hasAutocomplete = await emailInput.evaluate(el => 
    (el as HTMLInputElement).hasAttribute('autocomplete')
  );
  console.log(`✓ Email has autocomplete: ${hasAutocomplete}`);
  
  const viewport = page.viewportSize();
  console.log(`✓ Viewport: ${viewport?.width}x${viewport?.height} (mobile-first)`);
  
  // Test 5: Screenshot summary
  await page.screenshot({ path: '/tmp/15-final-check.png' });
  console.log('\n✅ All UX checks completed');
});
