import { expect, test } from "@playwright/test";

test("creates, focuses, and completes a task", async ({ page }) => {
  await page.goto("/today?add=true");

  await page.getByLabel("Task", { exact: true }).fill("E2E planning task");
  await page.getByLabel("Planned time (minutes)").fill("25");
  await page.getByRole("button", { name: "Add to today" }).click();

  await expect(
    page
      .getByRole("paragraph")
      .filter({ hasText: /^E2E planning task$/ }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Focus" }).click();
  await expect(
    page.getByRole("dialog", { name: "E2E planning task" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause" }).click();
  await page.getByRole("button", { name: "Complete" }).click();

  await expect(
    page.getByLabel("Actual minutes for E2E planning task"),
  ).toBeVisible();
});

test("keeps selected week in the URL", async ({ page }) => {
  await page.goto("/weekly");
  await page.getByRole("button", { name: "Next week" }).click();
  await expect(page).toHaveURL(/\/weekly\?week=\d{4}-\d{2}-\d{2}$/);
  await page.reload();
  await expect(page).toHaveURL(/\/weekly\?week=\d{4}-\d{2}-\d{2}$/);
  await expect(page.getByRole("button", { name: "Current week" })).toBeVisible();
});

test("public landing and sign-in do not overflow a mobile viewport", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "MAKE THE QUIET DAYS COUNT." }))
    .toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
