import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "mobile",
      use: { ...devices["iPhone 14"] },
    },
    {
      name: "mobile-se",
      use: { ...devices["iPhone SE"] },
    },
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: true,
  },
});
