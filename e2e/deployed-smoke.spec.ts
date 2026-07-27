import { expect, test } from "@playwright/test";

test("deployed landing page and build identity are healthy", async ({
  page,
  request,
}) => {
  const version = await request.get("/api/version");
  expect(version.ok()).toBe(true);
  expect(await version.json()).toMatchObject({
    version: expect.any(String),
    commit: expect.not.stringMatching(/^local$/),
    schemaVersion: expect.any(Number),
    environment: "production",
  });

  await page.goto("/");
  const createAccountLinks = page.getByRole("link", { name: "Create account" });
  await expect(createAccountLinks.first()).toBeVisible();
  const signInLinks = page.getByRole("link", { name: "Sign in" });
  await expect(signInLinks.first()).toBeVisible();
  expect(await createAccountLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  )).toEqual(["/signup", "/signup", "/signup"]);
  expect(await signInLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  )).toEqual(["/login", "/login"]);

  await expect(page.getByRole("link", { name: "Privacy" })).toHaveAttribute(
    "href",
    "/privacy",
  );
  await expect(page.getByRole("link", { name: "Terms" })).toHaveAttribute(
    "href",
    "/terms",
  );
});
