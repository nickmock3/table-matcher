import { expect, test } from "@playwright/test";

test("ホーム画面が表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "今空いている店を見つけよう" })).toBeVisible();
  await expect(page.getByRole("button", { name: "空席のみ: ON" })).toBeVisible();
});

test("トップ画面から条件指定して店舗詳細へ遷移できる", async ({ page }) => {
  await page.goto("/");

  await page.selectOption("#city", "新宿区");
  await page.getByRole("button", { name: "和食" }).click();

  const targetCard = page.getByRole("link", { name: /和食処 さくら/ });
  await expect(targetCard).toBeVisible();
  await targetCard.click();

  await expect(page).toHaveURL(/\/stores\/3$/);
  await expect(page.getByRole("heading", { name: "和食処 さくら" })).toBeVisible();
});
