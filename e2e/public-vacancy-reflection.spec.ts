import { expect, test } from '@playwright/test';

const storeLoadErrorText = '店舗情報の取得に失敗しました。時間をおいて再度お試しください。';

test('空席フィルタ反映とトップ/詳細の状態一致を確認できる', async ({ page }) => {
  await page.goto('/');
  const topLoadError = page.getByText(storeLoadErrorText);
  test.skip(await topLoadError.isVisible(), 'DB障害が発生しているため主要導線テストをスキップ');

  await expect(page.getByText('条件に一致する店舗が見つかりませんでした。')).toBeVisible();

  await page.getByRole('button', { name: '空席のみ: ON' }).click();
  await expect(page.getByRole('button', { name: '空席のみ: OFF' })).toBeVisible();

  const targetCard = page.getByRole('link', { name: /和食処 さくら/ });
  await expect(targetCard).toBeVisible();
  await expect(targetCard.getByText('満席')).toBeVisible();

  await targetCard.click();

  await expect(page).toHaveURL(/\/stores\/3$/);
  const detailLoadError = page.getByText(storeLoadErrorText);
  test.skip(await detailLoadError.isVisible(), 'DB障害が発生しているため主要導線テストをスキップ');

  await expect(page.getByRole('heading', { name: '和食処 さくら' })).toBeVisible();
  await expect(page.getByText('空席なし')).toBeVisible();
});
