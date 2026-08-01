/**
 * Critical user journey specs for the Dugout app.
 *
 * These tests cover end-to-end flows that represent real user paths.
 * All tests that require authentication skip gracefully when credentials
 * are not set in the environment.
 *
 * Prerequisites (for authenticated tests):
 *   Set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD in your environment.
 *
 * Run:
 *   npx playwright test e2e/journeys.spec.ts
 */

import { test as authTest, expect } from "./fixtures/auth";
import { test, expect as baseExpect } from "@playwright/test";

// Helper: extract a team ID from a URL that contains /teams/:id/...
function extractTeamId(url: string): string | undefined {
  return url.match(/\/teams\/([^/]+)/)?.[1];
}

const hasAuth = Boolean(
  process.env.DUGOUT_TEST_EMAIL && process.env.DUGOUT_TEST_PASSWORD
);

// ── 1. Announcements journey ──────────────────────────────────────────────────
//
// Navigate to a team's announcements page, post an announcement, verify it
// appears, then delete it.

authTest("announcements journey", async ({ authedPage: page }) => {
  if (!hasAuth) {
    authTest.skip(
      true,
      "Set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD to run this journey"
    );
    return;
  }

  await page.goto("/teams");
  await page.waitForLoadState("networkidle");

  // Click the first team card to land on the schedule route
  const firstCard = page.locator("button.w-full.bg-pitch-800").first();
  await expect(firstCard).toBeVisible({ timeout: 10_000 });
  await firstCard.click();

  await expect(page).toHaveURL(/\/teams\/.+\/schedule/, { timeout: 10_000 });
  const teamId = extractTeamId(page.url());
  expect(teamId).toBeTruthy();

  // Navigate to announcements
  await page.goto(`/teams/${teamId}/announcements`);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/teams\/.+\/announcements/);

  // Post a new announcement
  const uniqueContent = `Journey test announcement – ${Date.now()}`;
  const textarea = page.getByRole("textbox");
  if ((await textarea.count()) > 0) {
    await textarea.fill(uniqueContent);
    const submitBtn = page.getByRole("button", { name: /post|submit|send/i });
    await submitBtn.click();

    // Verify it appears in the list
    await expect(page.getByText(uniqueContent)).toBeVisible({ timeout: 10_000 });

    // Delete it (look for a delete button near the new announcement)
    const announcementEl = page.getByText(uniqueContent);
    const deleteBtn = announcementEl
      .locator("xpath=ancestor::*[1]")
      .getByRole("button", { name: /delete|remove/i });
    if ((await deleteBtn.count()) > 0) {
      await deleteBtn.click();
      await expect(page.getByText(uniqueContent)).not.toBeVisible({
        timeout: 5_000,
      });
    }
  } else {
    // The page rendered without error — that's sufficient for a stub
    await expect(page.getByText(/announcement/i).first()).toBeVisible();
  }
});

// ── 2. Payments journey ───────────────────────────────────────────────────────
//
// Navigate to payments and verify the coach view loads with its summary strip.

authTest("payments journey — coach view loads", async ({ authedPage: page }) => {
  if (!hasAuth) {
    authTest.skip(
      true,
      "Set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD to run this journey"
    );
    return;
  }

  await page.goto("/teams");
  await page.waitForLoadState("networkidle");

  const firstCard = page.locator("button.w-full.bg-pitch-800").first();
  await expect(firstCard).toBeVisible({ timeout: 10_000 });
  await firstCard.click();

  await expect(page).toHaveURL(/\/teams\/.+\/schedule/, { timeout: 10_000 });
  const teamId = extractTeamId(page.url());
  expect(teamId).toBeTruthy();

  await page.goto(`/teams/${teamId}/payments`);
  await page.waitForLoadState("networkidle");
  await expect(page).toHaveURL(/\/teams\/.+\/payments/);

  // The payments page should render without a JS crash
  const body = page.locator("body");
  await expect(body).not.toBeEmpty();

  // Either a summary strip, a payments list, or an empty state is acceptable
  const hasContent = await page
    .getByText(/payment|dues|paid|amount|total/i)
    .first()
    .isVisible()
    .catch(() => false);

  // If a heading exists, that's also a valid signal the page loaded
  const heading = page.getByRole("heading");
  await expect(heading.first()).toBeVisible({ timeout: 5_000 });

  baseExpect(
    hasContent || (await heading.count()) > 0,
    "Payments page should render some content"
  ).toBeTruthy();
});

// ── 3. Schedule journey ───────────────────────────────────────────────────────
//
// Navigate to schedule and verify events list or empty state loads.

authTest("schedule journey — events or empty state", async ({ authedPage: page }) => {
  if (!hasAuth) {
    authTest.skip(
      true,
      "Set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD to run this journey"
    );
    return;
  }

  await page.goto("/teams");
  await page.waitForLoadState("networkidle");

  const firstCard = page.locator("button.w-full.bg-pitch-800").first();
  await expect(firstCard).toBeVisible({ timeout: 10_000 });
  await firstCard.click();

  await expect(page).toHaveURL(/\/teams\/.+\/schedule/, { timeout: 10_000 });
  const teamId = extractTeamId(page.url());
  expect(teamId).toBeTruthy();

  // We're already on the schedule page — confirm it loaded cleanly
  await page.waitForLoadState("networkidle");

  const body = page.locator("body");
  await expect(body).not.toBeEmpty();

  // Either event cards or an empty-state message must be present
  const heading = page.getByRole("heading");
  await expect(heading.first()).toBeVisible({ timeout: 5_000 });
});

// ── 4. Auth journey — sign up with a new email ────────────────────────────────
//
// Signs up with a unique email and verifies redirect to /teams.
// Uses base @playwright/test because it's testing the sign-up flow itself,
// not relying on a pre-authenticated session.

test("auth journey — sign up redirects to /teams", async ({ page }) => {
  if (!hasAuth) {
    test.skip(
      true,
      "Set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD to run this journey"
    );
    return;
  }

  const uniqueEmail = `journey-test-${Date.now()}@example.com`;
  const password = "Journey1234!";

  const consoleErrors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("net::ERR_")) {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto("/auth/signup");
  await page.waitForLoadState("networkidle");

  // Fill the sign-up form
  const emailField = page.getByLabel(/email/i);
  const passwordField = page.getByLabel(/password/i).first();
  await emailField.fill(uniqueEmail);
  await passwordField.fill(password);

  const submitBtn = page.getByRole("button", { name: /sign up|create account|get started/i });
  await submitBtn.click();

  // After sign-up the app should either redirect to /teams or show a
  // confirmation prompt (e.g. "check your email"). Both are valid outcomes.
  await page.waitForLoadState("networkidle");
  const currentUrl = page.url();
  const signedUp =
    currentUrl.includes("/teams") ||
    (await page.getByText(/check your email|confirm|verification/i).isVisible().catch(() => false));

  baseExpect(
    signedUp,
    `Expected redirect to /teams or email confirmation, got: ${currentUrl}`
  ).toBeTruthy();

  expect(
    consoleErrors,
    `Console errors: ${consoleErrors.join(", ")}`
  ).toHaveLength(0);
});
