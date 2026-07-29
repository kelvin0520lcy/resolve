import type { Page } from "@playwright/test";

export async function waitForVisibleImages(page: Page) {
  await page.waitForFunction(async () => {
    const visibleImages = Array.from(document.images).filter((image) => {
      const style = getComputedStyle(image);
      const rect = image.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        Number.parseFloat(style.opacity || "1") > 0 &&
        rect.width > 0 &&
        rect.height > 0
      );
    });

    await Promise.all(
      visibleImages.map((image) =>
        image.decode().catch(() => undefined),
      ),
    );

    return visibleImages.every(
      (image) => image.complete && image.naturalWidth > 0,
    );
  });
}

export async function waitForStableVisualFrame(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  });
}
