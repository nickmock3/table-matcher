import type { Store, SearchFilters } from './types';

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
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });
}
