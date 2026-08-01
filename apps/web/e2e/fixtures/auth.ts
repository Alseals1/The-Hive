/**
 * Pre-authenticated Playwright fixture.
 *
 * Usage:
 *   import { test, expect } from '../fixtures/auth';
 *
 *   test('my test', async ({ authedPage }) => {
 *     await authedPage.goto('/teams');
 *     // page is already signed in
 *   });
 *
 * Prerequisites:
 *   Set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD in your environment.
 *   Tests that use `authedPage` are skipped automatically when these are absent.
 *
 * How it works:
 *   The first test that runs performs a real UI login and saves the Supabase
 *   session to a storageState file. Subsequent tests in the same run restore
 *   that state instantly, skipping the login flow entirely.
 *
 *   The storageState file is gitignored — it contains a real user session token.
 */

import { test as base, expect, type Page } from "@playwright/test";
import path from "path";
import fs from "fs";

const STORAGE_STATE_PATH = path.join(
  import.meta.dirname,
  "../../.playwright-auth-state.json"
);

async function loginViaUI(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");
  await page.getByLabel(/email/i).fill(email);
  await page.getByLabel(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/teams/, { timeout: 15_000 });
}

type AuthFixtures = {
  authedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authedPage: async ({ page, browser }, provide) => {
    const email = process.env.DUGOUT_TEST_EMAIL;
    const password = process.env.DUGOUT_TEST_PASSWORD;

    if (!email || !password) {
      test.skip(
        true,
        "Set DUGOUT_TEST_EMAIL and DUGOUT_TEST_PASSWORD to run authenticated tests"
      );
      await provide(page);
      return;
    }

    const stateExists = fs.existsSync(STORAGE_STATE_PATH);

    if (!stateExists) {
      // Perform a real login and persist the session
      await loginViaUI(page, email, password);
      await page.context().storageState({ path: STORAGE_STATE_PATH });
    } else {
      // Restore the existing session — no UI login needed
      const context = await browser.newContext({
        storageState: STORAGE_STATE_PATH,
      });
      const authedPage = await context.newPage();
      await authedPage.goto("/teams");
      await authedPage.waitForLoadState("networkidle");

      // If session expired, re-authenticate
      if (!authedPage.url().includes("/teams")) {
        fs.unlinkSync(STORAGE_STATE_PATH);
        await loginViaUI(authedPage, email, password);
        await authedPage.context().storageState({ path: STORAGE_STATE_PATH });
      }

      await provide(authedPage);
      await context.close();
      return;
    }

    await provide(page);
  },
});

export { expect };
