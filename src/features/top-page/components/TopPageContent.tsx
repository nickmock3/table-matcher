'use client';

import { useState } from 'react';
import type { SearchFilters } from '../types';
import { mockStores } from '../mockData';
import { filterStores, sortStores } from '../utils';
import { SearchForm } from './SearchForm';
import { GenreFilter } from './GenreFilter';
import { StoreList } from './StoreList';

export function TopPageContent() {
  const [filters, setFilters] = useState<SearchFilters>({
    city: null,
    genre: null,
    vacancyOnly: true,
  });

  const filteredStores = sortStores(filterStores(mockStores, filters));

  const handleReset = () => {
    setFilters({
      city: null,
      genre: null,
      vacancyOnly: true,
    });
  };

  return (
    <>
      <SearchForm filters={filters} onFiltersChange={setFilters} />
      <GenreFilter filters={filters} onFiltersChange={setFilters} />
      <StoreList stores={filteredStores} onReset={handleReset} />
    </>
  );
}
