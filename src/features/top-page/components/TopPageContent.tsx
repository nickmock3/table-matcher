'use client';

import { useState } from 'react';
import type { SearchFilters } from '../types';
import type { Store } from '../types';
import { defaultSearchFilters, filterStores, normalizeFilters, sortStores } from '../utils';
import { SearchForm } from './SearchForm';
import { GenreFilter } from './GenreFilter';
import { StoreList } from './StoreList';

type TopPageContentProps = {
  stores: Store[];
};

const uniqueSorted = (values: string[]): string[] => {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b, 'ja-JP'));
};

export function TopPageContent({ stores }: TopPageContentProps) {
  const filterOptions = {
    cities: uniqueSorted(stores.map((store) => store.city)),
    genres: uniqueSorted(stores.map((store) => store.genre)),
  };
  const [filters, setFilters] = useState<SearchFilters>(defaultSearchFilters);

  const normalizedFilters = normalizeFilters(filters, filterOptions);
  const filteredStores = sortStores(filterStores(stores, normalizedFilters));

  const handleReset = () => {
    setFilters(defaultSearchFilters);
  };

  return (
    <>
      <SearchForm cities={filterOptions.cities} filters={filters} onFiltersChange={setFilters} />
      <GenreFilter genres={filterOptions.genres} filters={filters} onFiltersChange={setFilters} />
      <StoreList stores={filteredStores} onReset={handleReset} />
    </>
  );
}
