import { notFound } from 'next/navigation';
import { StoreDetailPageContent } from '@/features/store-detail/components/StoreDetailPageContent';
import { resolvePublicStoreById } from '@/features/public-vacancy-reflection/public-store-resolver';

type StoreDetailPageProps = {
  params: Promise<{
    storeId: string;
  }>;
};

export default async function StoreDetailPage({ params }: StoreDetailPageProps) {
  const { storeId } = await params;
  const store = await resolvePublicStoreById(storeId);

  if (!store) {
    notFound();
  }

  return <StoreDetailPageContent store={store} />;
}
