import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const snapshotFont = readFileSync(
  join(
    process.cwd(),
    "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf",
  ),
).toString("base64");

const snapshotFontStyles = `
  @font-face {
    font-family: "Resolve Snapshot";
    src: url("data:font/ttf;base64,${snapshotFont}") format("truetype");
    font-style: normal;
    font-weight: 100 900;
  }

  [data-testid="guitar-preview-stage"],
  [data-testid="guitar-preview-stage"] * {
    font-family: "Resolve Snapshot", sans-serif !important;
    font-synthesis: none !important;
  }

  [data-testid="guitar-preview-stage"] {
    line-height: 1.5;
  }
`;

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
    await page.addStyleTag({ content: snapshotFontStyles });
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
    await page.evaluate(async () => {
      await Promise.all(
        [400, 500, 600, 700, 800, 900].map((weight) =>
          document.fonts.load(`${weight} 16px "Resolve Snapshot"`),
        ),
      );
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });
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
