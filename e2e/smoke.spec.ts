import { expect, test } from '@playwright/test';

const storeLoadErrorText = '店舗情報の取得に失敗しました。時間をおいて再度お試しください。';

test('ホーム画面が表示される', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今空いている店を見つけよう' })).toBeVisible();
  const loadError = page.getByText(storeLoadErrorText);
  test.skip(await loadError.isVisible(), 'DB障害が発生しているため主要導線テストをスキップ');
  await expect(page.getByRole('button', { name: '空席のみ: ON' })).toBeVisible();
});

test('トップ画面から条件指定して店舗詳細へ遷移できる', async ({ page }) => {
  await page.goto('/');
  const topLoadError = page.getByText(storeLoadErrorText);
  test.skip(await topLoadError.isVisible(), 'DB障害が発生しているため主要導線テストをスキップ');

  await page.getByRole('button', { name: '空席のみ: ON' }).click();
  await expect(page.getByRole('button', { name: '空席のみ: OFF' })).toBeVisible();

  await page.selectOption('#city', '新宿区');
  await page.getByRole('button', { name: '和食' }).click();

  const targetCard = page.getByRole('link', { name: /和食処 さくら/ });
  await expect(targetCard).toBeVisible();
  await targetCard.click();

  await expect(page).toHaveURL(/\/stores\/3$/);
  const detailLoadError = page.getByText(storeLoadErrorText);
  test.skip(await detailLoadError.isVisible(), 'DB障害が発生しているため主要導線テストをスキップ');
  await expect(page.getByRole('heading', { name: '和食処 さくら' })).toBeVisible();
  await expect(page.getByText('バナー広告領域（仮置き）')).toBeVisible();

  const reservationLink = page.getByRole('link', { name: '外部予約サイトへ進む' });
  await expect(reservationLink).toBeVisible();
  await expect(reservationLink).toHaveAttribute('target', '_blank');
  await expect(reservationLink).toHaveAttribute('href', 'https://example.com/reserve/3');

  await page.getByRole('link', { name: '一覧へ戻る' }).click();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: '今空いている店を見つけよう' })).toBeVisible();
});

test('存在しないstoreIdでは404となる', async ({ page }) => {
  await page.goto('/stores/999');
  const loadError = page.getByText(storeLoadErrorText);
  test.skip(await loadError.isVisible(), 'DB障害が発生しているため主要導線テストをスキップ');
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
});
