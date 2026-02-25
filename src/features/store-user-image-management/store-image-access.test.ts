import { describe, expect, it } from 'vitest';
import { resolveStoreImageScope, type StoreImageLink } from './store-image-access';

const createLink = (storeId: string): StoreImageLink => ({
  storeId,
  storeName: `Store ${storeId}`,
  imageUrls: null,
});

describe('resolveStoreImageScope', () => {
  it('1店舗紐づけ時は対象店舗を返す', async () => {
    const result = await resolveStoreImageScope(
      { loginEmail: 'shop@example.com' },
      { listStoreLinks: async () => [createLink('store-1')] },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.link.storeId).toBe('store-1');
  });

  it('複数店舗紐づけ時は409を返す', async () => {
    const result = await resolveStoreImageScope(
      { loginEmail: 'shop@example.com' },
      {
        listStoreLinks: async () => [createLink('store-1'), createLink('store-2')],
      },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(409);
  });

  it('要求店舗が紐づき外なら403を返す', async () => {
    const result = await resolveStoreImageScope(
      { loginEmail: 'shop@example.com', requestedStoreId: 'store-2' },
      { listStoreLinks: async () => [createLink('store-1')] },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.response.status).toBe(403);
  });
});

