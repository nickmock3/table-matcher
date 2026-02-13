import { notFound } from 'next/navigation';
import { StoreDetailPageContent } from '@/features/store-detail/components/StoreDetailPageContent';
import { mockStoreRepository } from '@/features/top-page/data/storeRepository';

type StoreDetailPageProps = {
  params: Promise<{
    storeId: string;
  }>;
};

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { storeId } = await params;
  const store = mockStoreRepository.findStoreById(storeId);

  if (!store) {
    notFound();
  }

  return <StoreDetailPageContent store={store} />;
}
