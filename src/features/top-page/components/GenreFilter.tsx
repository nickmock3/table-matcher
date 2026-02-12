'use client';

import type { SearchFilters } from '../types';

type GenreFilterProps = {
  genres: string[];
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
};

export function GenreFilter({ genres, filters, onFiltersChange }: GenreFilterProps) {
  const handleGenreClick = (genre: string | null) => {
    onFiltersChange({
      ...filters,
      genre,
    });
  };

  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {/* すべて */}
        <button
          type="button"
          onClick={() => handleGenreClick(null)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            filters.genre === null
              ? 'bg-main text-white'
              : 'border border-border bg-surface text-text hover:bg-main/10'
          }`}
        >
          すべて
        </button>

        {/* ジャンルボタン */}
        {genres.map((genre) => (
          <button
            key={genre}
            type="button"
            onClick={() => handleGenreClick(genre)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              filters.genre === genre
                ? 'bg-main text-white'
                : 'border border-border bg-surface text-text hover:bg-main/10'
            }`}
          >
            {genre}
          </button>
        ))}
      </div>
    </div>
  );
}
