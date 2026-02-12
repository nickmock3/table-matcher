'use client';

import type { SearchFilters } from '../types';
import { cities } from '../mockData';

type SearchFormProps = {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
};

export function SearchForm({ filters, onFiltersChange }: SearchFormProps) {
  const handleCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    onFiltersChange({
      ...filters,
      city: value === '' ? null : value,
    });
  };

  const handleVacancyOnlyToggle = () => {
    onFiltersChange({
      ...filters,
      vacancyOnly: !filters.vacancyOnly,
    });
  };

  return (
    <div className="mb-4 rounded-lg border border-border bg-surface p-4">
      <div className="space-y-3">
        {/* 市区町村 */}
        <div>
          <label htmlFor="city" className="mb-1.5 block text-xs text-text/80">
            📍 エリア
          </label>
          <select
            id="city"
            value={filters.city ?? ''}
            onChange={handleCityChange}
            className="w-full rounded-lg border border-border bg-base px-3 py-2.5 text-sm text-text focus:border-main focus:outline-none focus:ring-2 focus:ring-main/20"
          >
            <option value="">すべてのエリア</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* 空席のみ切り替え */}
        <button
          type="button"
          onClick={handleVacancyOnlyToggle}
          aria-pressed={filters.vacancyOnly}
          className={`w-full rounded-lg py-3 text-sm font-semibold transition-colors ${
            filters.vacancyOnly
              ? 'bg-accent text-white hover:bg-accent/90'
              : 'border-2 border-accent bg-white text-accent hover:bg-accent/5'
          }`}
        >
          {filters.vacancyOnly ? '空席のみ: ON' : '空席のみ: OFF'}
        </button>
      </div>
    </div>
  );
}
