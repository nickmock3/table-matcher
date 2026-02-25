import { expect, test, type Page } from '@playwright/test';

const setShopRoleHeader = async (page: Page, role: 'shop' | 'forbidden' | 'unauthorized') => {
  await page.context().setExtraHTTPHeaders({
    'x-e2e-shop-role': role,
  });
};

const shopRoleHeader = {
  'x-e2e-shop-role': 'shop',
};

const parseImageCount = async (page: Page): Promise<number> => {
  const text = await page.getByText(/^枚数:\s*\d+\/10$/).textContent();
  const match = text?.match(/枚数:\s*(\d+)\/10/);
  if (!match) {
    throw new Error('枚数表示の解析に失敗しました');
  }

  return Number(match[1]);
};

test('店舗ユーザーが画像をアップロードして保存し、公開画面へ反映できる', async ({ page }) => {
  await setShopRoleHeader(page, 'shop');

  const initialResponse = await page.request.get('/api/shop/images', { headers: shopRoleHeader });
  expect(initialResponse.ok()).toBe(true);
  const initialPayload = (await initialResponse.json()) as {
    ok: boolean;
    storeId: string;
    imageUrls: string[];
  };
  const initialImageUrls = initialPayload.imageUrls;

  await page.goto('/shop/images');

  await expect(page.getByRole('heading', { name: '店舗画像の管理' })).toBeVisible();

  const initialCount = await parseImageCount(page);
  if (initialCount >= 10) {
    await page.getByRole('button', { name: '削除' }).first().click();
    await expect(page.getByText('枚数: 9/10')).toBeVisible();
  }

  const uploadInput = page.locator('input[type="file"]');
  await uploadInput.setInputFiles({
    name: 'shop-image.png',
    mimeType: 'image/png',
    buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]),
  });
  await expect(page.getByText('アップロード中...')).toBeVisible();
  await expect(page.getByText('アップロード中...')).toBeHidden();
  await expect(page.getByText('画像を追加しました。保存すると公開画面へ反映されます。')).toBeVisible();

  const countAfterUpload = await parseImageCount(page);
  const expectedCount = initialCount >= 10 ? 10 : initialCount + 1;
  expect(countAfterUpload).toBe(expectedCount);

  if (countAfterUpload >= 2) {
    const first = page.locator('li[draggable="true"]').first();
    const second = page.locator('li[draggable="true"]').nth(1);
    await first.dragTo(second);
  }

  try {
    await page.getByRole('button', { name: '変更を保存する' }).click();
    await expect(
      page.getByText(/保存しました。公開画面に反映されます。|保存は完了しました。削除画像の後処理が保留中です。/),
    ).toBeVisible();

    await page.goto('/stores/3');
    await expect(page.getByRole('heading', { name: '和食処 さくら' })).toBeVisible();
    await expect(page.getByRole('button', { name: `画像 ${expectedCount} を表示` })).toBeVisible();
  } finally {
    const restoreResponse = await page.request.put('/api/shop/images', {
      headers: {
        ...shopRoleHeader,
        'Content-Type': 'application/json',
      },
      data: {
        storeId: initialPayload.storeId,
        imageUrls: initialImageUrls,
      },
    });
    expect(restoreResponse.ok()).toBe(true);
  }
});

test('未認証時は画像管理画面でUnauthorizedが表示される', async ({ page }) => {
  await setShopRoleHeader(page, 'unauthorized');
  await page.goto('/shop/images');

  await expect(page.getByText('Unauthorized')).toBeVisible();
  await expect(page.getByRole('button', { name: '変更を保存する' })).toBeDisabled();
});

test('非店舗ユーザー時は画像管理画面でForbiddenが表示される', async ({ page }) => {
  await setShopRoleHeader(page, 'forbidden');
  await page.goto('/shop/images');

  await expect(page.getByText('Forbidden')).toBeVisible();
  await expect(page.getByRole('button', { name: '変更を保存する' })).toBeDisabled();
});
