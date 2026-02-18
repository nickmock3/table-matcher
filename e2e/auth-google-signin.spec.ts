import { expect, test } from '@playwright/test';

test('未ログイン状態でログイン導線と再試行メッセージを確認できる', async ({ page }) => {
  let loginAttempted = false;

  await page.route('**/api/auth/get-session**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session: null,
        user: null,
      }),
    });
  });

  await page.route('**/api/auth/sign-in/social**', async (route) => {
    loginAttempted = true;
    await route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({
        message: 'mocked sign-in failure',
      }),
    });
  });

  await page.goto('/shop/login');

  await expect(page.getByRole('heading', { name: '店舗ユーザー / 管理者ログイン' })).toBeVisible();
  await expect(page.getByText('未ログインです。')).toBeVisible();

  await page.getByRole('button', { name: 'Googleでログイン' }).click();

  await expect.poll(() => loginAttempted).toBe(true);
  await expect(page.getByText('mocked sign-in failure')).toBeVisible();
});

test('ログイン済み状態からログアウトして未ログイン状態へ戻せる', async ({ page }) => {
  let isLoggedIn = true;

  await page.route('**/api/auth/get-session**', async (route) => {
    if (isLoggedIn) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          session: {
            id: 'session-1',
            userId: 'user-1',
            expiresAt: '2099-01-01T00:00:00.000Z',
          },
          user: {
            id: 'user-1',
            name: 'テスト店舗ユーザー',
            email: 'shop-sakura@example.com',
          },
        }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        session: null,
        user: null,
      }),
    });
  });

  await page.route('**/api/auth/sign-out**', async (route) => {
    isLoggedIn = false;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
      }),
    });
  });

  await page.goto('/shop/login');

  await expect(page.getByText('ログイン済みです。')).toBeVisible();
  await expect(page.getByText('メール: shop-sakura@example.com')).toBeVisible();

  await page.getByRole('button', { name: 'ログアウト' }).click();

  await expect(page.getByText('未ログインです。')).toBeVisible();
});

test('公開画面は認証APIが利用不可でも閲覧できる', async ({ page }) => {
  await page.route('**/api/auth/**', async (route) => {
    await route.fulfill({
      status: 503,
      contentType: 'application/json',
      body: JSON.stringify({
        ok: false,
        message: 'Auth is not available in this runtime. Use `bun run dev:cf`.',
      }),
    });
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: '今空いている店を見つけよう' })).toBeVisible();
  await expect(page).toHaveURL('/');

  await page.goto('/stores/1');
  await expect(page).toHaveURL(/\/stores\/1$/);
  await expect(page).not.toHaveURL(/\/shop\/login/);
});
