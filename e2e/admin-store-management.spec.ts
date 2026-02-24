import { expect, test, type Page } from '@playwright/test';

const setAdminRoleHeader = async (page: Page, role: 'admin' | 'shop' | 'unauthorized') => {
  await page.context().setExtraHTTPHeaders({
    'x-e2e-admin-role': role,
  });
};

const createPublishedStore = async (page: Page): Promise<{ storeId: string; storeName: string }> => {
  const storeName = `E2E 公開確認店舗 ${Date.now()}`;
  await page.goto('/admin/stores/new');

  await page.getByLabel('店名（必須）').fill(storeName);
  await page.getByLabel('市区町村（必須）').fill('渋谷区');
  await page.getByLabel('ジャンル（必須）').fill('公開反映テスト');
  await page.getByLabel('予約URL（必須）').fill('https://example.com/reserve/e2e-publish');
  await page.getByLabel('公開する').check();

  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page).toHaveURL('/admin/stores');

  const row = page.locator('tr', { hasText: storeName });
  await expect(row).toBeVisible();
  await row.getByRole('link', { name: '編集' }).click();

  await expect(page).toHaveURL(/\/admin\/stores\/[^/]+$/);
  const storeId = page.url().split('/').pop();
  if (!storeId) {
    throw new Error('店舗IDを取得できませんでした');
  }

  await page.goto('/admin/stores');
  return { storeId, storeName };
};

test('未認証時に管理画面アクセスは401表示となる', async ({ page }) => {
  await setAdminRoleHeader(page, 'unauthorized');
  await page.goto('/admin/stores');

  await expect(page.getByText('Unauthorized')).toBeVisible();
  await expect(page.getByRole('link', { name: 'ログイン画面へ' })).toBeVisible();
});

test('非管理者時に管理画面アクセスは403表示となる', async ({ page }) => {
  await setAdminRoleHeader(page, 'shop');
  await page.goto('/admin/stores');

  await expect(page.getByText('Forbidden')).toBeVisible();
});

test('管理者が店舗作成・編集できる', async ({ page }) => {
  await setAdminRoleHeader(page, 'admin');

  await page.goto('/admin/stores');
  await expect(page.getByRole('heading', { name: '店舗管理' })).toBeVisible();

  await page.getByRole('link', { name: '店舗を登録' }).click();
  await expect(page.getByRole('heading', { name: '店舗登録' })).toBeVisible();

  const uniqueName = `E2E 管理店舗 ${Date.now()}`;
  await page.getByLabel('店名（必須）').fill(uniqueName);
  await page.getByLabel('市区町村（必須）').fill('渋谷区');
  await page.getByLabel('ジャンル（必須）').fill('テスト');
  await page.getByLabel('予約URL（必須）').fill('https://example.com/reserve/e2e-admin');
  await page.getByLabel('公開する').check();

  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page).toHaveURL('/admin/stores');
  await expect(page.getByText(uniqueName)).toBeVisible();

  const row = page.locator('tr', { hasText: uniqueName });
  await row.getByRole('link', { name: '編集' }).click();
  await expect(page.getByRole('heading', { name: '店舗編集' })).toBeVisible();

  await page.getByLabel('ジャンル（必須）').fill('更新テスト');
  await page.getByRole('button', { name: '保存する' }).click();
  await expect(page).toHaveURL('/admin/stores');

  const updatedRow = page.locator('tr', { hasText: uniqueName });
  await expect(updatedRow.getByText('更新テスト')).toBeVisible();
});

test('公開状態の切り替えが公開画面へ反映される', async ({ page }) => {
  await setAdminRoleHeader(page, 'admin');

  await page.goto('/admin/stores');
  const { storeId, storeName } = await createPublishedStore(page);
  const targetRow = page.locator('tr', { hasText: storeName });
  await expect(targetRow).toBeVisible();

  await targetRow.getByRole('button', { name: '非公開にする' }).click();
  await expect(targetRow.getByRole('button', { name: '公開する' })).toBeVisible();

  await page.goto(`/stores/${storeId}`);
  await expect(page.getByRole('heading', { name: '404' })).toBeVisible();

  await page.goto('/admin/stores');
  const rowAfterReturn = page.locator('tr', { hasText: storeName });
  await rowAfterReturn.getByRole('button', { name: '公開する' }).click();
  await expect(rowAfterReturn.getByRole('button', { name: '非公開にする' })).toBeVisible();

  await page.goto(`/stores/${storeId}`);
  await expect(page.getByRole('heading', { name: storeName })).toBeVisible();
});
