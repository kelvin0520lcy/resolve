import { expect, test } from "@playwright/test";

test("a mobile learner can submit the application and confirm understanding", async ({
  page,
}) => {
  test.skip(
    (page.viewportSize()?.width ?? 1280) >= 768,
    "This regression protects the compact lesson layout.",
  );

  await page.goto("/guitar-preview");
  await page.getByLabel("Preview state").selectOption("lesson-application");

  const supportColumn = page.getByTestId("lesson-support-column");
  await expect(supportColumn).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirm understanding" }),
  ).toBeDisabled();

  await page.getByRole("radio").first().check();
  await page
    .getByRole("button", { name: "Save application result" })
    .click();

  const confirmButton = page.getByRole("button", {
    name: "Confirm understanding",
  });
  await expect(confirmButton).toBeVisible();
  await expect(confirmButton).toBeEnabled();
  await confirmButton.click();
  await expect(page.getByText("Lesson understood")).toBeVisible();
});
