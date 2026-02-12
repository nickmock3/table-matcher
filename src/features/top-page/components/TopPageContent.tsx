'use client';

import { useState } from 'react';
import type { SearchFilters } from '../types';
import { mockStoreRepository } from '../data/storeRepository';
import { defaultSearchFilters, filterStores, normalizeFilters, sortStores } from '../utils';
import { SearchForm } from './SearchForm';
import { GenreFilter } from './GenreFilter';
import { StoreList } from './StoreList';

export function TopPageContent() {
  const stores = mockStoreRepository.listStores();
  const filterOptions = mockStoreRepository.listFilterOptions();
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
