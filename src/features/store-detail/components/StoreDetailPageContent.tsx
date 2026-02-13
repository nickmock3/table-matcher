import Link from 'next/link';
import type { Store } from '@/features/top-page/types';
import { createStoreMapViewModel } from '@/features/store-detail/store-detail';
import { StoreImageCarousel } from './StoreImageCarousel';

type StoreDetailPageContentProps = {
  store: Store;
};

function VacancyBadge({ vacancyStatus }: { vacancyStatus: Store['vacancyStatus'] }) {
  const isAvailable = vacancyStatus === 'available';

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        isAvailable ? 'bg-accent text-white' : 'bg-text/80 text-white'
      }`}
    >
      {isAvailable ? '空席あり' : '空席なし'}
    </span>
  );
}

export function StoreDetailPageContent({ store }: StoreDetailPageContentProps) {
  const mapView = createStoreMapViewModel(store);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 pb-40 pt-10 text-text">
      <Link className="text-sm underline decoration-main hover:text-main-strong" href="/">
        一覧へ戻る
      </Link>

      <section className="mt-6 rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold text-main-strong">{store.name}</h1>

        <div className="mt-4">
          <StoreImageCarousel storeName={store.name} imageUrls={store.imageUrls} />
        </div>

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
            <dd>
              <VacancyBadge vacancyStatus={store.vacancyStatus} />
            </dd>
          </div>
          <div>
            <dt className="text-text/60">最終更新</dt>
            <dd>{new Date(store.updatedAt).toLocaleString('ja-JP')}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <a
            className="inline-flex items-center rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:bg-main-strong"
            href={store.reservationUrl}
            rel="noopener noreferrer"
            target="_blank"
          >
            外部予約サイトへ進む
          </a>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4">
        <h2 className="text-sm font-semibold text-text/80">地図</h2>
        {mapView.type === 'embed' ? (
          <div className="mt-3 overflow-hidden rounded-lg border border-border">
            <iframe
              title={mapView.label}
              src={mapView.src}
              className="h-56 w-full bg-base"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        ) : (
          <div className="mt-3 flex h-44 items-center justify-center rounded-lg bg-base text-sm text-text/60">
            {mapView.message}
          </div>
        )}
      </section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-emerald-700 bg-emerald-100/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] backdrop-blur-sm">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="text-sm font-semibold text-emerald-900">広告</h2>
          <div className="mt-2 flex h-20 items-center justify-center rounded-lg border border-emerald-700 bg-emerald-300 text-sm font-semibold text-emerald-900">
            バナー広告領域（仮置き）
          </div>
        </div>
      </div>
    </main>
  );
}
