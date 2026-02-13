import type { Store } from '@/features/top-page/types';

export type StoreMapViewModel =
  | {
      type: 'embed';
      src: string;
      label: string;
    }
  | {
      type: 'fallback';
      message: string;
    };

export function resolveStoreById(stores: Store[], storeId: string): Store | null {
  return stores.find((store) => store.id === storeId) ?? null;
}

export function createStoreMapViewModel(store: Store): StoreMapViewModel {
  if (typeof store.latitude === 'number' && typeof store.longitude === 'number') {
    const src = `https://www.google.com/maps?q=${store.latitude},${store.longitude}&z=15&output=embed`;
    return {
      type: 'embed',
      src,
      label: `${store.name} の地図`,
    };
  }

  if (store.address && store.address.trim().length > 0) {
    const src = `https://www.google.com/maps?q=${encodeURIComponent(store.address)}&z=15&output=embed`;
    return {
      type: 'embed',
      src,
      label: `${store.name} の地図`,
    };
  }

  return {
    type: 'fallback',
    message: '地図情報を準備中です。',
  };
}
