import type { Store } from '../types';
import { StoreCard } from './StoreCard';
import { EmptyState } from './EmptyState';

type StoreListProps = {
  stores: Store[];
  onReset?: () => void;
};

export function StoreList({ stores, onReset }: StoreListProps) {
  if (stores.length === 0) {
    return <EmptyState onReset={onReset} />;
  }

  return (
    <div>
      <h2 className="mb-4 text-base font-semibold text-text">
        おすすめのお店
        <span className="ml-2 text-sm font-normal text-text/60">
          {stores.length}件
        </span>
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </div>
  );
}
