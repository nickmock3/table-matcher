import { expect, test } from '@playwright/test';

test('店舗ユーザーが空席状態を空席ありに更新できる', async ({ page }) => {
  let status: 'available' | 'unavailable' = 'unavailable';
  let expiresAt = Math.floor(Date.now() / 1000) + 15 * 60;

  await page.route('**/api/shop/seat-status', async (route) => {
    const method = route.request().method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          storeId: '3',
          storeName: '和食処 さくら',
          coverImageUrl:
            'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=675&fit=crop',
          currentStatus: status,
          expiresAt,
          canMarkAvailable: status !== 'available',
        }),
      });
      return;
    }

    if (method === 'POST') {
      status = 'available';
      expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: true,
          storeId: '3',
          status: 'available',
          expiresAt,
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/shop/seat-status');

  await expect(page.getByRole('heading', { name: '空席状態の更新' })).toBeVisible();
  await expect(page.getByText('和食処 さくら')).toBeVisible();
  await expect(page.getByRole('img', { name: '和食処 さくら の店舗画像' })).toBeVisible();

  const updateButton = page.getByRole('button', { name: '空席ありに更新する' });
  await expect(updateButton).toBeEnabled();
  await updateButton.click();

  await expect(page.getByText('現在すでに「空席あり」のため、更新ボタンは無効です。')).toBeVisible();
  await expect(updateButton).toBeDisabled();
});

test('未認証エラー時に再試行可能なメッセージが表示される', async ({ page }) => {
  await page.route('**/api/shop/seat-status', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          message: 'Unauthorized',
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/shop/seat-status');

  await expect(page.getByText('Unauthorized')).toBeVisible();
  await expect(page.getByRole('button', { name: '空席ありに更新する' })).toBeDisabled();
});

test('認可エラー時にメッセージが表示され更新ボタンは無効になる', async ({ page }) => {
  await page.route('**/api/shop/seat-status', async (route) => {
    if (route.request().method() === 'GET') {
      await route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          ok: false,
          message: 'Forbidden',
        }),
      });
      return;
    }

    await route.continue();
  });

  await page.goto('/shop/seat-status');

  await expect(page.getByText('Forbidden')).toBeVisible();
  await expect(page.getByRole('button', { name: '空席ありに更新する' })).toBeDisabled();
});
