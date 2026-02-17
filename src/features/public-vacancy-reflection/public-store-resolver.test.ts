import { describe, expect, it } from 'vitest';

import { resolvePublicStoreById, resolvePublicStoresWithVacancy } from './public-store-resolver';
import type { Store } from '@/features/top-page/types';

const baseStores: Store[] = [
  {
    id: '1',
    name: '店A',
    city: '渋谷区',
    genre: 'カフェ',
    reservationUrl: 'https://example.com/1',
    vacancyStatus: 'unavailable',
    updatedAt: '2026-02-17T00:00:00Z',
  },
  {
    id: '2',
    name: '店B',
    city: '港区',
    genre: '和食',
    reservationUrl: 'https://example.com/2',
    vacancyStatus: 'available',
    updatedAt: '2026-02-17T00:00:00Z',
  },
];

describe('resolvePublicStoresWithVacancy', () => {
  it('更新レコードがない場合は全てunavailableを返す', async () => {
    const result = await resolvePublicStoresWithVacancy({
      baseStores,
      listSeatStatusUpdates: async () => [],
    });

    expect(result.find((store) => store.id === '1')?.vacancyStatus).toBe('unavailable');
    expect(result.find((store) => store.id === '2')?.vacancyStatus).toBe('unavailable');
  });

  it('更新レコードがある場合は空席状態を上書きする', async () => {
    const result = await resolvePublicStoresWithVacancy({
      baseStores,
      nowEpochSeconds: () => 1000,
      listSeatStatusUpdates: async () => [
        {
          id: 'r1',
          storeId: '1',
          status: 'available',
          expiresAt: 2000,
          createdAt: 1500,
        },
        {
          id: 'r2',
          storeId: '2',
          status: 'unavailable',
          expiresAt: 2000,
          createdAt: 1600,
        },
      ],
    });

    expect(result.find((store) => store.id === '1')?.vacancyStatus).toBe('available');
    expect(result.find((store) => store.id === '2')?.vacancyStatus).toBe('unavailable');
  });
});

describe('resolvePublicStoreById', () => {
  it('反映後の店舗をidで取得できる', async () => {
    const store = await resolvePublicStoreById('1', {
      baseStores,
      nowEpochSeconds: () => 1000,
      listSeatStatusUpdates: async () => [
        {
          id: 'r1',
          storeId: '1',
          status: 'available',
          expiresAt: 2000,
          createdAt: 1500,
        },
      ],
    });

    expect(store?.vacancyStatus).toBe('available');
  });

  it('存在しないidはnullを返す', async () => {
    const store = await resolvePublicStoreById('999', {
      baseStores,
      listSeatStatusUpdates: async () => [],
    });

    expect(store).toBeNull();
  });
});
