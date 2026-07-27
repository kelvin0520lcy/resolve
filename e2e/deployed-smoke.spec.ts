import { expect, test } from "@playwright/test";

test("deployed landing page and build identity are healthy", async ({
  page,
  request,
}) => {
  const version = await request.get("/api/version");
  expect(version.ok()).toBe(true);
  expect(await version.json()).toMatchObject({
    version: expect.any(String),
    commit: expect.not.stringMatching(/^local$/),
    schemaVersion: expect.any(Number),
    environment: "production",
  });

  await page.goto("/");
  await expect(page.getByRole("link", { name: "Create account" }).first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Sign in" }).first()).toBeVisible();
});
