import { mockStores } from '../mockData';
import type { FilterOptions, Store } from '../types';

export type StoreRepository = {
  listStores: () => Store[];
  listFilterOptions: () => FilterOptions;
  findStoreById: (storeId: string) => Store | null;
};

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ja-JP'));
}

const filterOptions: FilterOptions = {
  cities: uniqueSorted(mockStores.map((store) => store.city)),
  genres: uniqueSorted(mockStores.map((store) => store.genre)),
};

export const mockStoreRepository: StoreRepository = {
  listStores: () => mockStores,
  listFilterOptions: () => filterOptions,
  findStoreById: (storeId: string) => mockStores.find((store) => store.id === storeId) ?? null,
};
