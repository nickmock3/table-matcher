import Link from 'next/link';
import Image from 'next/image';
import type { Store } from '../types';

type StoreCardProps = {
  store: Store;
};

export function StoreCard({ store }: StoreCardProps) {
  const isAvailable = store.vacancyStatus === 'available';
  const updatedDate = new Date(store.updatedAt);
  const formattedTime = updatedDate.toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Link
      href={`/stores/${store.id}`}
      className="block overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-lg"
    >
      {/* 画像 */}
      <div className="relative aspect-[4/3] w-full bg-text/5">
        {store.imageUrl ? (
          <Image
            src={store.imageUrl}
            alt={store.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-text/40">
            No Image
          </div>
        )}

        {/* 空席バッジ（画像上） */}
        <div className="absolute left-3 top-3">
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-md ${
              isAvailable
                ? 'bg-accent text-white'
                : 'bg-text/80 text-white'
            }`}
          >
            {isAvailable ? '空席あります' : '満席'}
          </span>
        </div>
      </div>

      {/* 情報 */}
      <div className="p-4">
        <h3 className="mb-2 text-base font-semibold text-text">
          {store.name}
        </h3>

        <div className="mb-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-text/70">
          <span>{store.genre}</span>
          <span>•</span>
          <span>{store.city}</span>
        </div>

        <p className="text-xs text-text/50">最終更新: {formattedTime}</p>
      </div>
    </Link>
  );
}
