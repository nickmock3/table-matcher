import { expect, test } from "@playwright/test";

test("ホーム画面が表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Table Matcher MVP Setup" })).toBeVisible();
  await expect(page.getByRole("link", { name: "/api/health" })).toBeVisible();
});
