import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testIgnore: [
    "deployed-smoke.spec.ts",
    "guitar-preview-pixel.spec.ts",
  ],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: "http://127.0.0.1:3100",
    trace: "on-first-retry",
  },
  snapshotPathTemplate:
    "{testDir}/__screenshots__/{testFileName}/{arg}{ext}",
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chromium",
      use: { ...devices["Pixel 7"] },
    },
  ],
  webServer: {
    command:
      "env RESOLVE_NEXT_DIST_DIR=.next-e2e NEXT_PUBLIC_FIREBASE_API_KEY= NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN= NEXT_PUBLIC_FIREBASE_PROJECT_ID= NEXT_PUBLIC_FIREBASE_APP_ID= npm run dev -- -p 3100",
    url: "http://127.0.0.1:3100",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
