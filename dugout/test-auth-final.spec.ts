import { test, expect } from "@playwright/test";

test.use({
  viewport: { width: 375, height: 812 },
});

test("Login form - inline validation and error clearing", async ({ page }) => {
  await page.goto("http://localhost:5175/auth/login");

  // Test 1: Empty form submission shows field-level errors
  await page.click("button[type=submit]");

  // Wait for React to update the state and re-render
  await page.waitForTimeout(200);

  // Now check for error messages
  const emailErrorVisible = await page.locator("text=Email is required").isVisible();
  const passwordErrorVisible = await page.locator("text=Password is required").isVisible();

  expect(emailErrorVisible).toBe(true);
  expect(passwordErrorVisible).toBe(true);
  console.log("✓ Inline validation errors appear");

  // Test 2: Fix email field and verify error clears
  await page.fill('input[id="email"]', "test@example.com");
  await page.waitForTimeout(100);

  const emailErrorGone = !(await page.locator("text=Email is required").isVisible());
  expect(emailErrorGone).toBe(true);
  console.log("✓ Email error cleared on input");

  // Test 3: Fill password and verify error clears
  await page.fill('input[id="password"]', "password123");
  await page.waitForTimeout(100);

  const passwordErrorGone = !(await page.locator("text=Password is required").isVisible());
  expect(passwordErrorGone).toBe(true);
  console.log("✓ Password error cleared on input");

  // Test 4: Verify no required attributes (would trigger native popups)
  const emailInput = page.locator('input[id="email"]');
  const hasRequired = await emailInput.getAttribute("required");
  expect(hasRequired).toBeNull();
  console.log("✓ HTML5 required attribute removed (no native popups)");
});

test("Signup form - validation and password blur", async ({ page }) => {
  await page.goto("http://localhost:5175/auth/signup");

  // Test 1: Empty submission shows errors
  await page.click("button[type=submit]");
  await page.waitForTimeout(200);

  const nameError = await page.locator("text=Full name is required").isVisible();
  const emailError = await page.locator("text=Email is required").isVisible();
  const passwordError = await page.locator("text=Password is required").isVisible();

  expect(nameError && emailError && passwordError).toBe(true);
  console.log("✓ All field errors appear on empty submit");

  // Test 2: Password blur validation
  await page.fill('input[id="name"]', "John");
  await page.fill('input[id="email"]', "john@example.com");
  await page.fill('input[id="password"]', "short");

  // Focus on email field to blur password
  await page.focus('input[id="email"]');
  await page.waitForTimeout(200);

  const passwordLengthError = await page.locator("text=Password must be at least 8 characters").isVisible();
  expect(passwordLengthError).toBe(true);
  console.log("✓ Password length error shows on blur");

  // Test 3: Fix password and error clears
  await page.fill('input[id="password"]', "verylongpassword");
  await page.waitForTimeout(100);

  const passwordLengthErrorGone = !(await page.locator("text=Password must be at least 8 characters").isVisible());
  expect(passwordLengthErrorGone).toBe(true);
  console.log("✓ Password error clears when >= 8 chars");
});

test("Loading spinner in button", async ({ page }) => {
  await page.goto("http://localhost:5175/auth/login");

  await page.fill('input[id="email"]', "test@example.com");
  await page.fill('input[id="password"]', "password123");

  const submitButton = page.locator('button[type=submit]');

  // Initial state
  const initialText = await submitButton.textContent();
  expect(initialText).toContain("Sign In");

  // Click submit
  await submitButton.click();
  await page.waitForTimeout(300);

  // Check loading state
  const loadingText = await submitButton.textContent();
  const isDisabled = await submitButton.isDisabled();

  expect(loadingText).toContain("Signing in");
  expect(isDisabled).toBe(true);
  console.log("✓ Button shows loading text and disabled state");
});
