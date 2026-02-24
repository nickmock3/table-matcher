import { AdminStoreFormPageContent } from '@/features/admin-store-management/components/AdminStoreFormPageContent';

type AdminStoreEditPageProps = {
  params: Promise<{
    storeId: string;
  }>;
};

export default async function AdminStoreEditPage({ params }: AdminStoreEditPageProps) {
  const { storeId } = await params;
  return <AdminStoreFormPageContent mode="edit" storeId={storeId} />;
}
