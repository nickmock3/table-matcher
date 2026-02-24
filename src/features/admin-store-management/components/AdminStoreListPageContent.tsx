'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminStore } from '@/features/admin-store-management/admin-store-form';
import { formatPublishStatus } from '@/features/admin-store-management/admin-store-list';

const parseErrorMessage = (payload: unknown, fallback: string): string => {
  if (typeof payload !== 'object' || payload === null) {
    return fallback;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
};

const parseStores = (payload: unknown): AdminStore[] => {
  if (typeof payload !== 'object' || payload === null) return [];
  const stores = (payload as { stores?: unknown }).stores;
  if (!Array.isArray(stores)) return [];
  return stores as AdminStore[];
};

export function AdminStoreListPageContent() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadStores = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch('/api/admin/stores');
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setErrorMessage(parseErrorMessage(payload, '店舗一覧の取得に失敗しました。'));
        setStores([]);
        return;
      }

      setStores(parseStores(payload));
    } catch {
      setErrorMessage('通信エラーが発生しました。時間をおいて再試行してください。');
      setStores([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStores();
  }, [loadStores]);

  const handleTogglePublish = async (store: AdminStore) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const response = await fetch(`/api/admin/stores/${store.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isPublished: !store.isPublished }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setErrorMessage(parseErrorMessage(payload, '公開状態の更新に失敗しました。'));
        return;
      }

      await loadStores();
    } catch {
      setErrorMessage('通信エラーが発生しました。時間をおいて再試行してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const empty = useMemo(() => !isLoading && stores.length === 0 && !errorMessage, [errorMessage, isLoading, stores]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 text-text">
      <div className="rounded-xl border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-main-strong">店舗管理</h1>
            <p className="mt-2 text-sm text-text/70">管理者向けの店舗一覧です。新規登録・編集・公開切替ができます。</p>
          </div>
          <Link
            href="/admin/stores/new"
            className="inline-flex items-center justify-center rounded-lg bg-main px-4 py-2 text-sm font-semibold text-white"
          >
            店舗を登録
          </Link>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{errorMessage}</p>
            {errorMessage === 'Unauthorized' ? (
              <Link className="mt-2 inline-flex underline" href="/shop/login">
                ログイン画面へ
              </Link>
            ) : null}
          </div>
        ) : null}

        {isLoading ? <p className="mt-6 text-sm text-text/70">店舗一覧を読み込み中です...</p> : null}

        {empty ? (
          <p className="mt-6 text-sm text-text/70">登録されている店舗はありません。</p>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-border text-left">
                  <th className="px-2 py-2">店名</th>
                  <th className="px-2 py-2">市区町村</th>
                  <th className="px-2 py-2">ジャンル</th>
                  <th className="px-2 py-2">公開状態</th>
                  <th className="px-2 py-2">操作</th>
                </tr>
              </thead>
              <tbody>
                {stores.map((store) => (
                  <tr key={store.id} className="border-b border-border/70">
                    <td className="px-2 py-3">{store.name}</td>
                    <td className="px-2 py-3">{store.city}</td>
                    <td className="px-2 py-3">{store.genre}</td>
                    <td className="px-2 py-3">{formatPublishStatus(store.isPublished)}</td>
                    <td className="px-2 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/admin/stores/${store.id}`}
                          className="inline-flex items-center justify-center rounded-md border border-border bg-base px-3 py-1"
                        >
                          編集
                        </Link>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => {
                            void handleTogglePublish(store);
                          }}
                          className="inline-flex items-center justify-center rounded-md border border-border bg-base px-3 py-1 disabled:opacity-60"
                        >
                          {store.isPublished ? '非公開にする' : '公開する'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6">
          <Link className="text-sm underline decoration-main hover:text-main-strong" href="/">
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
