import { Hero } from '@/features/top-page/components/Hero';
import { TopPageContent } from '@/features/top-page/components/TopPageContent';
import { resolvePublicStoresWithVacancyResult } from '@/features/public-vacancy-reflection/public-store-resolver';

type HomePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const isE2EForceStoreLoadError = (value: string | string[] | undefined): boolean => {
  const resolved = Array.isArray(value) ? value[0] : value;
  return process.env.E2E_FORCE_ERROR_ENABLED === '1' && resolved === '1';
};

export default async function Home({ searchParams }: HomePageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const storesResult = isE2EForceStoreLoadError(resolvedSearchParams?.__e2e_force_store_error)
    ? { ok: false as const }
    : await resolvePublicStoresWithVacancyResult();

  return (
    <main className="min-h-screen bg-base">
      <Hero />
      <div className="mx-auto max-w-3xl px-6 pb-16">
        {storesResult.ok ? (
          <TopPageContent stores={storesResult.stores} />
        ) : (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            店舗情報の取得に失敗しました。時間をおいて再度お試しください。
          </div>
        )}
      </div>
    </main>
  );
}
