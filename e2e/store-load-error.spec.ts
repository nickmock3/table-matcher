import { expect, test } from '@playwright/test';

const storeLoadErrorText = '店舗情報の取得に失敗しました。時間をおいて再度お試しください。';
const forceStoreLoadErrorQuery = '__e2e_force_store_error=1';

test('トップ画面で店舗情報取得失敗バナーを表示できる', async ({ page }) => {
  await page.goto(`/?${forceStoreLoadErrorQuery}`);
  await expect(page.getByText(storeLoadErrorText)).toBeVisible();
});

test('店舗詳細画面で店舗情報取得失敗バナーを表示できる', async ({ page }) => {
  await page.goto(`/stores/3?${forceStoreLoadErrorQuery}`);
  await expect(page.getByText(storeLoadErrorText)).toBeVisible();
});
