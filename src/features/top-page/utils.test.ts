import { describe, expect, it } from 'vitest';
import { defaultSearchFilters, filterStores, normalizeFilters, sortStores } from './utils';
import type { FilterOptions, SearchFilters, Store } from './types';

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

const filterOptions: FilterOptions = {
  cities: ['渋谷区', '港区'],
  genres: ['カフェ', '和食'],
};

describe('normalizeFilters', () => {
  it('converts unknown city/genre to null', () => {
    const result = normalizeFilters(
      { city: '千代田区', genre: 'イタリアン', vacancyOnly: true },
      filterOptions,
    );

    expect(result).toEqual({
      city: null,
      genre: null,
      vacancyOnly: true,
    });
  });

  it('keeps valid city/genre unchanged', () => {
    const result = normalizeFilters(
      { city: '渋谷区', genre: '和食', vacancyOnly: false },
      filterOptions,
    );

    expect(result).toEqual({
      city: '渋谷区',
      genre: '和食',
      vacancyOnly: false,
    });
  });
});

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

  it('puts invalid updatedAt behind valid dates within same vacancy group', () => {
    const result = sortStores([
      { ...stores[0], id: '4', updatedAt: 'invalid-date' },
      { ...stores[0], id: '5', updatedAt: '2026-02-12T12:00:00Z' },
    ]);

    expect(result.map((store) => store.id)).toEqual(['5', '4']);
  });
});

describe('defaultSearchFilters', () => {
  it('uses vacancyOnly true with no city/genre filters', () => {
    expect(defaultSearchFilters).toEqual({
      city: null,
      genre: null,
      vacancyOnly: true,
    });
  });
});
