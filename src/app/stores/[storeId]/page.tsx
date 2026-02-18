import { notFound } from 'next/navigation';
import { StoreDetailPageContent } from '@/features/store-detail/components/StoreDetailPageContent';
import { resolvePublicStoreByIdResult } from '@/features/public-vacancy-reflection/public-store-resolver';

type StoreDetailPageProps = {
  params: Promise<{
    storeId: string;
  }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const isE2EForceStoreLoadError = (value: string | string[] | undefined): boolean => {
  const resolved = Array.isArray(value) ? value[0] : value;
  return process.env.E2E_FORCE_ERROR_ENABLED === '1' && resolved === '1';
};

export default async function StoreDetailPage({ params, searchParams }: StoreDetailPageProps) {
  const { storeId } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  if (isE2EForceStoreLoadError(resolvedSearchParams?.__e2e_force_store_error)) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-text">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          店舗情報の取得に失敗しました。時間をおいて再度お試しください。
        </div>
      </main>
    );
  }

  const result = await resolvePublicStoreByIdResult(storeId);

  if (!result.ok && result.reason === 'not_found') {
    notFound();
  }

  if (!result.ok) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-text">
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          店舗情報の取得に失敗しました。時間をおいて再度お試しください。
        </div>
      </main>
    );
  }

  return <StoreDetailPageContent store={result.store} />;
}
