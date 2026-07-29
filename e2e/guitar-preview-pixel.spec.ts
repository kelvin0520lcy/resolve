import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const snapshotFont = readFileSync(
  join(
    process.cwd(),
    "node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf",
  ),
).toString("base64");

const previewStates = [
  "placement",
  "learn",
  "lesson-visual",
  "lesson-checkpoint",
  "lesson-application",
  "lesson-completed",
  "practice",
  "rhythm-guided",
  "rhythm-sandbox",
  "chord-trainer",
  "sandbox-tool",
  "progress",
  "partial",
  "completed",
] as const;

async function prepareStablePreview(page: Page, previewState: string) {
  await page.goto("/guitar-preview");
  await page.evaluate(async (fontData) => {
    const source = `url("data:font/ttf;base64,${fontData}")`;
    await Promise.all(
      [400, 500, 600, 700, 800, 900].map(async (weight) => {
        const font = new FontFace("Resolve Snapshot", source, {
          style: "normal",
          weight: String(weight),
        });
        await font.load();
        document.fonts.add(font);
      }),
    );
  }, snapshotFont);
  await page.addStyleTag({
    content: `
      main, main * {
        font-family: "Resolve Snapshot", sans-serif !important;
        font-synthesis: none !important;
      }
      main { line-height: 1.5; }
      nextjs-portal { display: none !important; }
    `,
  });
  await page.getByLabel("Preview state").selectOption(previewState);

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
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
  return stage;
}

for (const previewState of previewStates) {
  test(`${previewState} matches the pinned visual reference @guitar-pixel`, async ({
    page,
  }) => {
    const stage = await prepareStablePreview(page, previewState);
    const box = await stage.boundingBox();
    expect(box).not.toBeNull();

    const mobile = (page.viewportSize()?.width ?? 1280) < 768;
    await expect(page).toHaveScreenshot(
      `guitar-preview-pixel-${previewState}-${
        mobile ? "mobile" : "desktop"
      }.png`,
      {
        animations: "disabled",
        caret: "hide",
        clip: {
          x: Math.floor(box!.x),
          y: Math.floor(box!.y),
          width: Math.floor(box!.width),
          height: mobile ? 800 : 650,
        },
        // The pinned Linux container still has up to 3% font-rasterization
        // drift between runs. Production typography hierarchy and overflow
        // are guarded separately by guitar-preview-production-font.spec.ts.
        maxDiffPixelRatio: 0.03,
      },
    );
  });
}

test("the full interface shell matches the pinned visual reference @guitar-pixel", async ({
  page,
}) => {
  await prepareStablePreview(page, "learn");
  const mobile = (page.viewportSize()?.width ?? 1280) < 768;

  await expect(page).toHaveScreenshot(
    `guitar-preview-shell-${mobile ? "mobile" : "desktop"}.png`,
    {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.03,
    },
  );
});
