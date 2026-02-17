import { describe, expect, it } from 'vitest';

import { applyVacancyStatusToStores, createVacancyStatusMap, resolveVacancyStatus } from './vacancy-status';
import type { Store } from '@/features/top-page/types';

const baseStores: Store[] = [
  {
    id: 'store-1',
    name: 'A',
    city: '渋谷区',
    genre: 'カフェ',
    reservationUrl: 'https://example.com/1',
    vacancyStatus: 'unavailable',
    updatedAt: '2026-02-17T00:00:00Z',
  },
  {
    id: 'store-2',
    name: 'B',
    city: '港区',
    genre: '和食',
    reservationUrl: 'https://example.com/2',
    vacancyStatus: 'available',
    updatedAt: '2026-02-17T00:00:00Z',
  },
];

describe('resolveVacancyStatus', () => {
  it('有効レコードが無い場合はunavailableを返す', () => {
    const result = resolveVacancyStatus([], 1000);
    expect(result).toBe('unavailable');
  });

  it('expiresAtが現在時刻以下のレコードは無効扱いにする', () => {
    const result = resolveVacancyStatus(
      [
        {
          id: 'a',
          storeId: 'store-1',
          status: 'available',
          expiresAt: 1000,
          createdAt: 1200,
        },
      ],
      1000,
    );

    expect(result).toBe('unavailable');
  });

  it('createdAtの降順で最新有効レコードを採用する', () => {
    const result = resolveVacancyStatus(
      [
        {
          id: 'a',
          storeId: 'store-1',
          status: 'unavailable',
          expiresAt: 2000,
          createdAt: 1100,
        },
        {
          id: 'b',
          storeId: 'store-1',
          status: 'available',
          expiresAt: 2000,
          createdAt: 1200,
        },
      ],
      1000,
    );

    expect(result).toBe('available');
  });

  it('createdAt同値時はid降順で最新を採用する', () => {
    const result = resolveVacancyStatus(
      [
        {
          id: '0001',
          storeId: 'store-1',
          status: 'unavailable',
          expiresAt: 2000,
          createdAt: 1200,
        },
        {
          id: '0002',
          storeId: 'store-1',
          status: 'available',
          expiresAt: 2000,
          createdAt: 1200,
        },
      ],
      1000,
    );

    expect(result).toBe('available');
  });
});

describe('createVacancyStatusMap', () => {
  it('storeIdごとの状態マップを生成する', () => {
    const result = createVacancyStatusMap(
      ['store-1', 'store-2', 'store-3'],
      [
        {
          id: 'x',
          storeId: 'store-1',
          status: 'available',
          expiresAt: 2000,
          createdAt: 1500,
        },
        {
          id: 'y',
          storeId: 'store-2',
          status: 'unavailable',
          expiresAt: 2000,
          createdAt: 1500,
        },
      ],
      1000,
    );

    expect(result.get('store-1')).toBe('available');
    expect(result.get('store-2')).toBe('unavailable');
    expect(result.get('store-3')).toBe('unavailable');
  });
});

describe('applyVacancyStatusToStores', () => {
  it('店舗配列へ導出した空席状態を反映する', () => {
    const result = applyVacancyStatusToStores(
      baseStores,
      [
        {
          id: 'r1',
          storeId: 'store-1',
          status: 'available',
          expiresAt: 2000,
          createdAt: 1500,
        },
      ],
      1000,
    );

    expect(result[0].vacancyStatus).toBe('available');
    expect(result[1].vacancyStatus).toBe('unavailable');
  });
});
