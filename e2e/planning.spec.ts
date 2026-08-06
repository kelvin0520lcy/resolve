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

test("keeps resolution editor text readable on its paper surface", async ({
  page,
}) => {
  await page.goto("/dashboard");

  const initialEditor = page.getByLabel("New semester resolution", {
    exact: true,
  });
  await initialEditor.fill("Build a steady semester rhythm");
  await page
    .getByRole("button", { name: "Add resolution", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Add resolution", exact: true })
    .click();

  const editor = page.getByLabel("New semester resolution", { exact: true });
  await editor.fill("Readable draft text");
  const cancel = page.getByRole("button", { name: "Cancel", exact: true });

  await expect(editor).toHaveCSS("color", "rgb(24, 18, 31)");
  await expect(editor).toHaveCSS("caret-color", "rgb(24, 18, 31)");
  await expect(cancel).toHaveCSS("color", "rgb(24, 18, 31)");
});

test("public landing and sign-in do not overflow a mobile viewport", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.getByText("Semester live house · public beta")).toBeVisible();
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
