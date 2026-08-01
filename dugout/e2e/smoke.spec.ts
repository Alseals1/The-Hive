/**
 * Smoke tests for the join / invite / roster flows.
 *
 * Prerequisites:
 *   - Dev server running on http://localhost:5173
 *   - For the roster test: set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD
 *     to a valid Supabase account that is already a member of any team.
 *
 * Run:
 *   npx playwright test e2e/smoke.spec.ts
 */

import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const JOIN_CODE = "T253QL";

// ── 1. /join/:code loads successfully ─────────────────────────────────────────

test("join page loads for code T253QL", async ({ page }) => {
  const consoleErrors: string[] = [];
  // Capture JS errors and unhandled rejections; ignore network resource failures
  // (ERR_NAME_NOT_RESOLVED etc. are expected when Supabase isn't reachable locally)
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("net::ERR_")) {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  await page.goto(`/join/${JOIN_CODE}`);
  await page.waitForLoadState("networkidle");

  // Page-level title
  await expect(page).toHaveTitle(/Join Team/i);

  // Header rendered by PageShell
  await expect(page.getByRole("heading", { name: /join team/i })).toBeVisible();

  // The page either shows a team preview OR the "Code Invalid" error state —
  // both are valid outcomes depending on whether T253QL exists in the DB.
  // What must NOT happen: a blank page, a JS crash, or an HTTP error.
  const body = page.locator("body");
  await expect(body).not.toBeEmpty();

  const heading = page.getByRole("heading");
  await expect(heading.first()).toBeVisible();

  expect(consoleErrors, `Console errors: ${consoleErrors.join(", ")}`).toHaveLength(0);
});

// ── 1b. /join/:code has no critical accessibility violations ──────────────────

test("join page has no critical accessibility violations", async ({ page }) => {
  await page.goto(`/join/${JOIN_CODE}`);
  await page.waitForLoadState("networkidle");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa"])
    .analyze();
  const critical = results.violations.filter(
    (v) => v.impact === "critical" || v.impact === "serious"
  );
  expect(
    critical,
    `Critical a11y violations:\n${critical.map((v) => `[${v.impact}] ${v.id}: ${v.description}`).join("\n")}`
  ).toHaveLength(0);
});

// ── 2. /invite/:token loads even with an invalid token ────────────────────────

test("invite page loads with an invalid token", async ({ page }) => {
  const consoleErrors: string[] = [];
  // Capture JS errors and unhandled rejections; ignore network resource failures.
  // "net::ERR_" covers DNS / connection failures; "Failed to load resource" covers
  // HTTP 404/5xx responses from external resources (e.g. Supabase unreachable).
  page.on("console", (msg) => {
    if (
      msg.type() === "error" &&
      !msg.text().includes("net::ERR_") &&
      !msg.text().includes("Failed to load resource")
    ) {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  // A well-formed UUID that will not exist in the database
  const invalidToken = "00000000-0000-0000-0000-000000000000";

  await page.goto(`/invite/${invalidToken}`);
  await page.waitForLoadState("networkidle");

  await expect(page).toHaveTitle(/Join Team/i);

  // The "Link Expired" error state should render
  await expect(
    page.getByRole("heading", { name: /link expired/i })
  ).toBeVisible();

  await expect(
    page.getByText(/expired|already been used|doesn't exist/i).first()
  ).toBeVisible();

  // Fallback CTA must be present
  await expect(
    page.getByRole("button", { name: /go to login/i })
  ).toBeVisible();

  expect(consoleErrors, `Console errors: ${consoleErrors.join(", ")}`).toHaveLength(0);
});

// ── 3. Roster page loads for an authenticated user ────────────────────────────

test("roster page loads for authenticated user", async ({ page }) => {
  const email = process.env.DUGOUT_TEST_EMAIL;
  const password = process.env.DUGOUT_TEST_PASSWORD;

  if (!email || !password) {
    test.skip(
      true,
      "Set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD to run this test"
    );
    return;
  }

  const consoleErrors: string[] = [];
  // Capture JS errors and unhandled rejections; ignore network resource failures
  // (ERR_NAME_NOT_RESOLVED etc. are expected when Supabase isn't reachable locally)
  page.on("console", (msg) => {
    if (msg.type() === "error" && !msg.text().includes("net::ERR_")) {
      consoleErrors.push(msg.text());
    }
  });
  page.on("pageerror", (err) => consoleErrors.push(err.message));

  // Log in via the UI so Supabase auth is properly initialised
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");

  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();

  // After login the app redirects to /teams
  await expect(page).toHaveURL(/\/teams/, { timeout: 15_000 });

  // TeamCard renders as a <button> (not an <a>); click the first one
  // and let the router navigate to /teams/:id/schedule, then extract the id.
  const firstCard = page.locator("button.w-full.bg-pitch-800").first();
  await expect(firstCard).toBeVisible({ timeout: 10_000 });
  await firstCard.click();

  await expect(page).toHaveURL(/\/teams\/.+\/schedule/, { timeout: 10_000 });
  const teamId = page.url().match(/\/teams\/([^/]+)\/schedule/)?.[1];
  expect(teamId).toBeTruthy();

  // Navigate to the roster route for that team
  await page.goto(`/teams/${teamId}/roster`);
  await page.waitForLoadState("networkidle");

  // Roster page must render without redirecting to login
  await expect(page).toHaveURL(/\/teams\/.+\/roster/);

  // At minimum the word "Roster" should appear somewhere on the page
  await expect(page.getByText(/roster/i).first()).toBeVisible();

  expect(consoleErrors, `Console errors: ${consoleErrors.join(", ")}`).toHaveLength(0);
});
