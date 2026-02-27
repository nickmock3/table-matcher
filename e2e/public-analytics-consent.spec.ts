import { expect, test } from '@playwright/test';

test('公開ユーザーが同意設定を保存し、後から変更できる', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByText('アクセス解析の設定')).toBeVisible();

  await page.getByRole('button', { name: '同意する' }).click();
  await expect(page.getByText('アクセス解析の設定')).toBeHidden();

  await page.reload();
  await expect(page.getByText('アクセス解析の設定')).toBeHidden();

  await page.getByRole('button', { name: '解析設定' }).click();
  await expect(page.getByText('アクセス解析の設定')).toBeVisible();

  await page.getByRole('button', { name: '同意しない' }).click();
  await expect(page.getByText('アクセス解析の設定')).toBeHidden();

  await page.reload();
  await expect(page.getByText('アクセス解析の設定')).toBeHidden();
});
