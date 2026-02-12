import { describe, expect, it } from 'vitest';
import { filterStores, sortStores } from './utils';
import type { SearchFilters, Store } from './types';

const stores: Store[] = [
  {
    id: '1',
    name: 'A',
    city: '渋谷区',
    genre: 'カフェ',
    reservationUrl: 'https://example.com/1',
    vacancyStatus: 'available',
    updatedAt: '2026-02-12T10:00:00Z',
  },
  {
    id: '2',
    name: 'B',
    city: '港区',
    genre: '和食',
    reservationUrl: 'https://example.com/2',
    vacancyStatus: 'unavailable',
    updatedAt: '2026-02-12T11:00:00Z',
  },
  {
    id: '3',
    name: 'C',
    city: '渋谷区',
    genre: '和食',
    reservationUrl: 'https://example.com/3',
    vacancyStatus: 'available',
    updatedAt: '2026-02-12T09:00:00Z',
  },
];

describe('filterStores', () => {
  it('filters by vacancyOnly when true', () => {
    const filters: SearchFilters = { city: null, genre: null, vacancyOnly: true };
    const result = filterStores(stores, filters);

    expect(result.map((store) => store.id)).toEqual(['1', '3']);
  });

  it('filters by city and genre together', () => {
    const filters: SearchFilters = { city: '渋谷区', genre: '和食', vacancyOnly: false };
    const result = filterStores(stores, filters);

    expect(result.map((store) => store.id)).toEqual(['3']);
  });
});

describe('sortStores', () => {
  it('sorts available stores first, then updatedAt desc in each group', () => {
    const result = sortStores(stores);

    expect(result.map((store) => store.id)).toEqual(['1', '3', '2']);
  });
});
