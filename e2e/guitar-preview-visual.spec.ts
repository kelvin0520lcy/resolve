import { expect, test } from "@playwright/test";

const previewStates = [
  "placement",
  "learn",
  "lesson-visual",
  "lesson-checkpoint",
  "lesson-application",
  "rhythm-guided",
  "chord-trainer",
  "sandbox-tool",
  "progress",
] as const;

for (const previewState of previewStates) {
  test(`${previewState} keeps its intended Guitar Studio layout`, async ({
    page,
  }) => {
    await page.goto("/guitar-preview");
    await page.getByLabel("Preview state").selectOption(previewState);
    await page.addStyleTag({
      content: "nextjs-portal { display: none !important; }",
    });

    const stage = page.getByTestId("guitar-preview-stage");
    await expect(stage).toBeVisible();
    await page.waitForFunction(() =>
      Array.from(document.images)
        .filter((image) => image.loading !== "lazy")
        .every((image) => image.complete),
    );
    await page.waitForFunction(() =>
      Array.from(document.querySelectorAll('[role="status"]')).every(
        (status) =>
          !status.textContent?.includes("Setting up the studio tool"),
      ),
    );
    await expect(stage).toHaveScreenshot(
      `guitar-preview-${previewState}-${
        (page.viewportSize()?.width ?? 1280) < 768
          ? "mobile"
          : "desktop"
      }.png`,
      {
        animations: "disabled",
        caret: "hide",
        maxDiffPixelRatio: 0.03,
      },
    );
  });
}
