import { expect, test, type Page } from "@playwright/test";

async function chooseTool(
  page: Page,
  category: string,
  tool: string,
) {
  const mobileCategory = page.getByLabel("Tool category");
  if ((page.viewportSize()?.width ?? 1280) < 1280) {
    await mobileCategory.selectOption(category);
  }
  await page.getByRole("button", { name: tool, exact: true }).click();
}

test("keeps chord diagrams continuous and rhythm beats responsive", async ({
  page,
}) => {
  await page.goto("/guitar");
  await page.getByRole("tab", { name: "Tools", exact: true }).click();

  await chooseTool(page, "Harmony", "Chord changes");
  for (const chord of ["G", "C"]) {
    const diagram = page.locator(`svg[aria-label="${chord} chord diagram"]`);
    await expect(diagram).toBeVisible();
    await expect(diagram.locator("line")).toHaveCount(12);
    await expect(
      diagram.locator('line[x1="40"][x2="200"]'),
    ).toHaveCount(6);
    await expect(
      diagram.locator('line[y1="48"][y2="208"]'),
    ).toHaveCount(6);
  }

  await chooseTool(page, "Rhythm", "Rhythm");
  const sandbox = page.getByRole("button", {
    name: "sandbox",
    exact: true,
  });
  if (await sandbox.isVisible()) await sandbox.click();
  await page.getByLabel("Subdivision").selectOption("16");

  const rhythmBar = page.getByTestId("rhythm-bar-grid-1");
  await expect(rhythmBar).toBeVisible();
  await expect(
    rhythmBar.locator('[data-testid^="rhythm-beat-group-"]'),
  ).toHaveCount(4);

  const widths = await rhythmBar.evaluate((element) => ({
    client: element.clientWidth,
    scroll: element.scrollWidth,
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  expect(widths.document).toBeLessThanOrEqual(widths.viewport + 1);
});
