import { notFound } from 'next/navigation';
import { StoreDetailPageContent } from '@/features/store-detail/components/StoreDetailPageContent';
import { resolveStoreById } from '@/features/store-detail/store-detail';
import { mockStoreRepository } from '@/features/top-page/data/storeRepository';

type StoreDetailPageProps = {
  params: Promise<{
    storeId: string;
  }>;
};

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { storeId } = await params;
  const stores = mockStoreRepository.listStores();
  const store = resolveStoreById(stores, storeId);

  if (!store) {
    notFound();
  }

  return <StoreDetailPageContent store={store} />;
}
