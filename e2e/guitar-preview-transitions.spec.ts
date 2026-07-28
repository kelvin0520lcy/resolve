import { expect, test } from "@playwright/test";

test("preview navigation does not leak tool mode or lesson stage", async ({
  page,
}) => {
  await page.goto("/guitar-preview");
  const previewState = page.getByLabel("Preview state");

  await previewState.selectOption("rhythm-sandbox");
  await expect(
    page.getByRole("button", { name: "sandbox", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  await previewState.selectOption("lesson-visual");
  await page
    .getByRole("button", {
      name: "Open guided rhythm example",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("button", { name: "guided", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByRole("heading", {
      name: "Find the repeating pulse",
      exact: true,
    }),
  ).toBeVisible();

  await previewState.selectOption("learn");
  await previewState.selectOption("lesson-visual");
  await page.getByRole("button", { name: "Back to Learn" }).click();
  await page.getByRole("button", { name: "Start lesson" }).click();

  await expect(
    page.getByLabel("Lesson stage", { exact: true }),
  ).toHaveValue("0");
});
