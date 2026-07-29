import { expect, test, type Locator, type Page } from "@playwright/test";
import {
  waitForStableVisualFrame,
  waitForVisibleImages,
} from "./support/visual-readiness";

const productionFontStates = [
  "learn",
  "lesson-application",
  "rhythm-guided",
  "progress",
] as const;

async function waitForPreview(page: Page, previewState: string) {
  await page.goto("/guitar-preview");
  await page.addStyleTag({
    content: "nextjs-portal { display: none !important; }",
  });
  await page.getByLabel("Preview state").selectOption(previewState);
  const stage = page.getByTestId("guitar-preview-stage");
  await expect(stage).toBeVisible();
  await waitForVisibleImages(page);
  await page.waitForFunction(() =>
    Array.from(document.querySelectorAll('[role="status"]')).every(
      (status) =>
        !status.textContent?.includes("Setting up the studio tool"),
    ),
  );
  await waitForStableVisualFrame(page);
  return stage;
}

async function expectProductionTypographyToFit(
  page: Page,
  stage: Locator,
) {
  const metrics = await stage.evaluate((element) => {
    const stageRect = element.getBoundingClientRect();
    const clippedText = Array.from(
      element.querySelectorAll<HTMLElement>(
        "button, [role='tab'], h1, h2, h3, label",
      ),
    )
      .filter((candidate) => {
        if (candidate.classList.contains("sr-only")) return false;
        const style = getComputedStyle(candidate);
        const rect = candidate.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          ((style.overflowX === "hidden" &&
            candidate.scrollWidth > candidate.clientWidth + 1) ||
            (style.overflowY === "hidden" &&
              candidate.scrollHeight > candidate.clientHeight + 1))
        );
      })
      .map((candidate) => candidate.textContent?.trim().slice(0, 80));

    const offscreenText = Array.from(
      element.querySelectorAll<HTMLElement>(
        "button, [role='tab'], h1, h2, h3, label",
      ),
    )
      .filter((candidate) => {
        const rect = candidate.getBoundingClientRect();
        return (
          rect.width > 0 &&
          rect.height > 0 &&
          (rect.left < stageRect.left - 1 ||
            rect.right > stageRect.right + 1)
        );
      })
      .map((candidate) => candidate.textContent?.trim().slice(0, 80));

    return {
      fontFamily: getComputedStyle(element).fontFamily,
      clippedText,
      offscreenText,
    };
  });

  expect(metrics.fontFamily).not.toContain("Resolve Snapshot");
  expect(metrics.clippedText).toEqual([]);
  expect(metrics.offscreenText).toEqual([]);

  const hierarchy = await page.evaluate(() => {
    const previewStage = document.querySelector<HTMLElement>(
      '[data-testid="guitar-preview-stage"]',
    );
    const heading = previewStage?.querySelector<HTMLElement>(
      '[data-testid="page-intro-heading"]',
    );
    const description = previewStage?.querySelector<HTMLElement>(
      '[data-testid="page-intro-description"]',
    );
    const activeTabLabel = document.querySelector<HTMLElement>(
      '[aria-label="Guitar Studio sections"] [role="tab"][aria-selected="true"] [data-testid="guitar-tab-label"]',
    );

    const styleOf = (element: HTMLElement | null) => {
      if (!element) return null;
      const style = getComputedStyle(element);
      return {
        fontFamily: style.fontFamily,
        fontSize: Number.parseFloat(style.fontSize),
        fontWeight: Number.parseInt(style.fontWeight, 10),
      };
    };

    return {
      heading: styleOf(heading ?? null),
      description: styleOf(description ?? null),
      activeTabLabel: styleOf(activeTabLabel),
    };
  });

  expect(hierarchy.heading).not.toBeNull();
  expect(hierarchy.description).not.toBeNull();
  expect(hierarchy.activeTabLabel).not.toBeNull();
  expect(hierarchy.heading!.fontFamily).not.toBe(
    hierarchy.description!.fontFamily,
  );
  expect(hierarchy.heading!.fontSize).toBeGreaterThan(
    hierarchy.description!.fontSize + 8,
  );
  // The display heading intentionally derives hierarchy from its condensed
  // family and larger size; Impact reports a numerical weight of 400.
  expect(hierarchy.description!.fontWeight).toBeGreaterThanOrEqual(500);
  expect(hierarchy.activeTabLabel!.fontWeight).toBeGreaterThanOrEqual(
    800,
  );

  const rendered = await page.screenshot({
    animations: "disabled",
    caret: "hide",
  });
  expect(rendered.byteLength).toBeGreaterThan(10_000);
}

for (const previewState of productionFontStates) {
  test(`${previewState} keeps production typography readable`, async ({
    page,
  }) => {
    const stage = await waitForPreview(page, previewState);
    await expectProductionTypographyToFit(page, stage);
  });
}

test("production typography keeps every main Studio tab visible", async ({
  page,
}) => {
  await waitForPreview(page, "learn");
  const navigation = page.getByRole("navigation", {
    name: "Guitar Studio sections",
  });
  await expect(navigation.getByRole("tab")).toHaveCount(4);

  const tabLayout = await navigation.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
    clippedTabs: Array.from(
      element.querySelectorAll<HTMLElement>('[role="tab"]'),
    )
      .filter((tab) => tab.scrollWidth > tab.clientWidth + 1)
      .map((tab) => tab.getAttribute("aria-label")),
  }));
  expect(tabLayout.scrollWidth).toBeLessThanOrEqual(
    tabLayout.clientWidth + 1,
  );
  expect(tabLayout.clippedTabs).toEqual([]);
});
