import { expect, test } from "@playwright/test";

test("deployed landing page and build identity are healthy", async ({
  page,
  request,
}) => {
  const version = await request.get("/api/version");
  expect(version.ok()).toBe(true);
  const build = await version.json();
  expect(build).toMatchObject({
    version: expect.any(String),
    commit: expect.not.stringMatching(/^local$/),
    schemaVersion: expect.any(Number),
    environment: "production",
  });
  const expectedCommit = process.env.EXPECTED_COMMIT_SHA?.trim();
  if (expectedCommit) {
    expect(build.commit.startsWith(expectedCommit)).toBe(true);
  }

  const health = await request.get("/api/health");
  expect(health.ok()).toBe(true);
  await expect(health.json()).resolves.toMatchObject({
    status: "ok",
    checks: {
      configuration: true,
      firebaseAdmin: true,
    },
  });

  await page.goto("/");
  await expect(page.getByText("Semester live house · public beta")).toBeVisible();
  const createAccountLinks = page.getByRole("link", { name: "Create account" });
  await expect(createAccountLinks.first()).toBeVisible();
  const signInLinks = page.getByRole("link", { name: "Sign in" });
  await expect(signInLinks.first()).toBeVisible();
  const callsToAction = await page.locator("a").evaluateAll((links) =>
    links.map((link) => ({
      label: link.textContent?.replace(/\s+/g, " ").trim(),
      href: link.getAttribute("href"),
    })),
  );
  expect(
    callsToAction
      .filter(({ label }) => label === "Create account")
      .map(({ href }) => href),
  ).toEqual(["/signup", "/signup", "/signup"]);
  expect(
    callsToAction
      .filter(({ label }) => label === "Sign in")
      .map(({ href }) => href),
  ).toEqual(["/login", "/login"]);

  await expect(page.getByRole("link", { name: "Privacy" })).toHaveAttribute(
    "href",
    "/privacy",
  );
  await expect(page.getByRole("link", { name: "Terms" })).toHaveAttribute(
    "href",
    "/terms",
  );
});
