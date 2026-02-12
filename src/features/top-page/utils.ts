import type { FilterOptions, SearchFilters, Store } from './types';

export const defaultSearchFilters: SearchFilters = {
  city: null,
  genre: null,
  vacancyOnly: true,
};

/**
 * UIから来た検索条件を正規化する
 * - 未知の city/genre は null 扱い
 * - 空文字は null 扱い
 */
export function normalizeFilters(filters: SearchFilters, options: FilterOptions): SearchFilters {
  const city = filters.city && options.cities.includes(filters.city) ? filters.city : null;
  const genre = filters.genre && options.genres.includes(filters.genre) ? filters.genre : null;

  return {
    city,
    genre,
    vacancyOnly: Boolean(filters.vacancyOnly),
  };
}

/**
 * 検索条件に基づいて店舗をフィルタリング
 */
export function filterStores(stores: Store[], filters: SearchFilters): Store[] {
  return stores.filter((store) => {
    // 空席のみフィルタ
    if (filters.vacancyOnly && store.vacancyStatus !== 'available') {
      return false;
    }

    // 市区町村フィルタ
    if (filters.city && store.city !== filters.city) {
      return false;
    }

    // ジャンルフィルタ
    if (filters.genre && store.genre !== filters.genre) {
      return false;
    }

    return true;
  });
}

/**
 * 店舗を並び順でソート
 * - 空席優先
 * - 各グループ内は更新日時降順
 */
export function sortStores(stores: Store[]): Store[] {
  return [...stores].sort((a, b) => {
    // 1. 空席優先
    if (a.vacancyStatus === 'available' && b.vacancyStatus !== 'available') {
      return -1;
    }
    if (a.vacancyStatus !== 'available' && b.vacancyStatus === 'available') {
      return 1;
    }

    // 2. 同グループ内は更新日時降順
    const bTime = Date.parse(b.updatedAt);
    const aTime = Date.parse(a.updatedAt);
    const normalizedBTime = Number.isNaN(bTime) ? 0 : bTime;
    const normalizedATime = Number.isNaN(aTime) ? 0 : aTime;

    return normalizedBTime - normalizedATime;
  });
}
