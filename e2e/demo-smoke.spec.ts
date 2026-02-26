import { expect, test, type Page } from '@playwright/test';

const setAdminRoleHeader = async (page: Page) => {
  await page.context().setExtraHTTPHeaders({
    'x-e2e-admin-role': 'admin',
  });
};

const setShopRoleHeader = async (page: Page) => {
  await page.context().setExtraHTTPHeaders({
    'x-e2e-shop-role': 'shop',
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

test('中間提出向けスモーク導線（管理者->店舗ユーザー->公開反映）', async ({ page }) => {
  await setShopRoleHeader(page);
  const initialResponse = await page.request.get('/api/shop/images', { headers: shopRoleHeader });
  expect(initialResponse.ok()).toBe(true);
  const initialPayload = (await initialResponse.json()) as {
    ok: boolean;
    storeId: string;
    storeName: string | null;
    imageUrls: string[];
  };
  const initialImageUrls = initialPayload.imageUrls;
  const smokeGenre = `デモ更新-${Date.now()}`;
  let originalGenre = '';
  let shouldRestoreGenre = false;

  try {
    await setAdminRoleHeader(page);
    await page.goto('/admin/stores');
    await expect(page.getByRole('heading', { name: '店舗管理' })).toBeVisible();

    await page.goto(`/admin/stores/${initialPayload.storeId}`);
    await expect(page.getByRole('heading', { name: '店舗編集' })).toBeVisible();
    originalGenre = (await page.getByLabel('ジャンル（必須）').inputValue()).trim();
    shouldRestoreGenre = true;
    await page.getByLabel('ジャンル（必須）').fill(smokeGenre);
    await page.getByRole('button', { name: '保存する' }).click();
    await expect(page).toHaveURL('/admin/stores');
    await expect(page.locator('tr', { hasText: initialPayload.storeId }).getByText(smokeGenre)).toBeVisible();

    await setShopRoleHeader(page);
    await page.goto('/shop/images');
    await expect(page.getByRole('heading', { name: '店舗画像の管理' })).toBeVisible();

    const initialCount = await parseImageCount(page);
    if (initialCount >= 10) {
      await page.getByRole('button', { name: '削除' }).first().click();
      await expect(page.getByText('枚数: 9/10')).toBeVisible();
    }

    const uploadInput = page.locator('input[type="file"]');
    await uploadInput.setInputFiles({
      name: 'demo-smoke-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]),
    });

    await expect(page.getByText('アップロード中...')).toBeVisible();
    await expect(page.getByText('アップロード中...')).toBeHidden();
    await expect(page.getByText('画像を追加しました。保存すると公開画面へ反映されます。')).toBeVisible();

    const countAfterUpload = await parseImageCount(page);
    const expectedCount = initialCount >= 10 ? 10 : initialCount + 1;
    expect(countAfterUpload).toBe(expectedCount);

    await page.getByRole('button', { name: '変更を保存する' }).click();
    await expect(
      page.getByText(/保存しました。公開画面に反映されます。|保存は完了しました。削除画像の後処理が保留中です。/),
    ).toBeVisible();

    await page.context().setExtraHTTPHeaders({});
    await page.goto(`/stores/${initialPayload.storeId}`);
    if (initialPayload.storeName) {
      await expect(page.getByRole('heading', { name: initialPayload.storeName })).toBeVisible();
    }
    await expect(page.getByText(smokeGenre)).toBeVisible();
    await expect(page.getByRole('button', { name: `画像 ${expectedCount} を表示` })).toBeVisible();
  } finally {
    if (shouldRestoreGenre) {
      await setAdminRoleHeader(page);
      const restoreAdminResponse = await page.request.patch(`/api/admin/stores/${initialPayload.storeId}`, {
        headers: {
          'x-e2e-admin-role': 'admin',
          'Content-Type': 'application/json',
        },
        data: {
          genre: originalGenre,
        },
      });
      expect(restoreAdminResponse.ok()).toBe(true);
    }

    await setShopRoleHeader(page);
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
