import { describe, expect, it } from 'vitest';
import type { Store } from '@/features/top-page/types';
import { createStoreMapViewModel, resolveStoreById } from './store-detail';

const stores: Store[] = [
  {
    id: '1',
    name: 'A',
    city: '渋谷区',
    genre: 'カフェ',
    reservationUrl: 'https://example.com/1',
    vacancyStatus: 'available',
    updatedAt: '2026-02-12T10:00:00Z',
    latitude: 35.66,
    longitude: 139.7,
  },
  {
    id: '2',
    name: 'B',
    city: '港区',
    genre: '和食',
    reservationUrl: 'https://example.com/2',
    vacancyStatus: 'unavailable',
    updatedAt: '2026-02-12T11:00:00Z',
    address: '東京都港区芝公園4-2-8',
  },
  {
    id: '3',
    name: 'C',
    city: '新宿区',
    genre: '中華',
    reservationUrl: 'https://example.com/3',
    vacancyStatus: 'available',
    updatedAt: '2026-02-12T09:00:00Z',
  },
];

describe('resolveStoreById', () => {
  it('returns a store when id exists', () => {
    const result = resolveStoreById(stores, '2');
    expect(result?.name).toBe('B');
  });

  it('returns null when id does not exist', () => {
    const result = resolveStoreById(stores, '999');
    expect(result).toBeNull();
  });
});

describe('createStoreMapViewModel', () => {
  it('creates embed map model from latitude/longitude', () => {
    const result = createStoreMapViewModel(stores[0]);
    expect(result.type).toBe('embed');
    if (result.type === 'embed') {
      expect(result.src).toContain('35.66,139.7');
    }
  });

  it('creates embed map model from address when lat/lng missing', () => {
    const result = createStoreMapViewModel(stores[1]);
    expect(result.type).toBe('embed');
    if (result.type === 'embed') {
      expect(result.src).toContain(encodeURIComponent('東京都港区芝公園4-2-8'));
    }
  });

  it('returns fallback model when location info is missing', () => {
    const result = createStoreMapViewModel(stores[2]);
    expect(result).toEqual({
      type: 'fallback',
      message: '地図情報を準備中です。',
    });
  });
});
