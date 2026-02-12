import Link from 'next/link';
import { notFound } from 'next/navigation';
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

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-text">
      <Link className="text-sm underline decoration-main hover:text-main-strong" href="/">
        一覧へ戻る
      </Link>
      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold text-main-strong">{store.name}</h1>
        <dl className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
          <div>
            <dt className="text-text/60">ジャンル</dt>
            <dd>{store.genre}</dd>
          </div>
          <div>
            <dt className="text-text/60">市区町村</dt>
            <dd>{store.city}</dd>
          </div>
          <div>
            <dt className="text-text/60">空席状態</dt>
            <dd>{store.vacancyStatus === 'available' ? '空席あり' : '空席なし'}</dd>
          </div>
          <div>
            <dt className="text-text/60">最終更新</dt>
            <dd>{new Date(store.updatedAt).toLocaleString('ja-JP')}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
