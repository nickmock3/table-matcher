import { expect, test } from '@playwright/test';

test('同意済みの場合は公開導線で閲覧イベントを送信する', async ({ page }) => {
  const trackedPayloads: Array<Record<string, unknown>> = [];

  await page.route('**/api/public/analytics/page-view', async (route) => {
    const request = route.request();
    if (request.method() === 'POST') {
      const raw = request.postData();
      trackedPayloads.push(raw ? (JSON.parse(raw) as Record<string, unknown>) : {});
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, tracked: true }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '同意する' }).click();
  await page.reload();
  await expect(page).toHaveURL('/');

  await expect.poll(() => trackedPayloads.length > 0).toBe(true);

  const payload = trackedPayloads[0];
  expect(payload?.path).toBe('/');
  expect(payload?.sessionId).toEqual(expect.any(String));
  expect(payload?.occurredAt).toEqual(expect.any(Number));
});

test('同意拒否の場合は閲覧イベントを送信しない', async ({ page }) => {
  let trackedCount = 0;

  await page.route('**/api/public/analytics/page-view', async (route) => {
    if (route.request().method() === 'POST') {
      trackedCount += 1;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true, tracked: true }),
    });
  });

  await page.goto('/');
  await page.getByRole('button', { name: '同意しない' }).click();
  await page.reload();
  await expect(page).toHaveURL('/');

  await page.waitForTimeout(300);
  expect(trackedCount).toBe(0);
});
