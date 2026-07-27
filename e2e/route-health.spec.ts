import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/login",
  "/signup",
  "/reset-password",
  "/privacy",
  "/terms",
  "/dashboard",
  "/today",
  "/weekly",
  "/habits",
  "/guitar",
  "/academics",
  "/analytics",
  "/career",
  "/goals",
  "/reflections",
  "/settings",
  "/timeline",
] as const;

const ignoredConsoleErrors = [
  // Browser extensions and devtools can emit this independently of the app.
  /Download the React DevTools/i,
] as const;

function monitorRuntime(page: Page) {
  const errors: string[] = [];

  page.on("pageerror", (error) => {
    errors.push(`pageerror: ${error.stack ?? error.message}`);
  });

  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      !ignoredConsoleErrors.some((pattern) => pattern.test(message.text()))
    ) {
      errors.push(`console.error: ${message.text()}`);
    }
  });

  page.on("requestfailed", (request) => {
    const failure = request.failure();
    if (failure?.errorText !== "net::ERR_ABORTED") {
      errors.push(
        `requestfailed: ${request.method()} ${request.url()} (${failure?.errorText ?? "unknown error"})`,
      );
    }
  });

  return errors;
}

for (const route of routes) {
  test(`${route} loads without runtime or layout failures`, async ({ page }) => {
    const runtimeErrors = monitorRuntime(page);
    const response = await page.goto(route, { waitUntil: "load" });

    expect(response, `No navigation response was returned for ${route}`).not.toBeNull();
    expect(response?.status(), `${route} returned an HTTP error`).toBeLessThan(400);
    await expect(page.locator("body")).toBeVisible();
    await expect(page.locator("body")).not.toContainText(
      /application error|internal server error|this page could not be found/i,
    );

    const layout = await page.evaluate(() => ({
      viewportWidth: window.innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      emptyBody: document.body.innerText.trim().length === 0,
    }));

    expect(layout.emptyBody, `${route} rendered an empty body`).toBe(false);
    expect(
      Math.max(layout.documentWidth, layout.bodyWidth),
      `${route} overflows its ${layout.viewportWidth}px viewport`,
    ).toBeLessThanOrEqual(layout.viewportWidth + 1);
    expect(runtimeErrors, `Runtime failures occurred while loading ${route}`).toEqual(
      [],
    );
  });
}
