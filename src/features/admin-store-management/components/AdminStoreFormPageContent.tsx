'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  buildAdminStorePayload,
  createEmptyAdminStoreFormValues,
  toAdminStoreFormValues,
  type AdminStore,
  type AdminStoreFormValues,
} from '@/features/admin-store-management/admin-store-form';

type AdminStoreFormPageContentProps = {
  mode: 'create' | 'edit';
  storeId?: string;
};

const parseErrorMessage = (payload: unknown, fallback: string): string => {
  if (typeof payload !== 'object' || payload === null) {
    return fallback;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === 'string' && message.length > 0 ? message : fallback;
};

const extractStores = (payload: unknown): AdminStore[] => {
  if (typeof payload !== 'object' || payload === null) return [];
  const stores = (payload as { stores?: unknown }).stores;
  if (!Array.isArray(stores)) return [];
  return stores as AdminStore[];
};

const buildTitle = (mode: 'create' | 'edit'): string => {
  return mode === 'create' ? '店舗登録' : '店舗編集';
};

export function AdminStoreFormPageContent({ mode, storeId }: AdminStoreFormPageContentProps) {
  const router = useRouter();
  const [form, setForm] = useState<AdminStoreFormValues>(createEmptyAdminStoreFormValues);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'edit' || !storeId) return;

    const loadStore = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const response = await fetch('/api/admin/stores');
        const payload = await response.json().catch(() => null);
        if (!response.ok) {
          setErrorMessage(parseErrorMessage(payload, '店舗情報の取得に失敗しました。'));
          return;
        }

        const store = extractStores(payload).find((item) => item.id === storeId) ?? null;
        if (!store) {
          setErrorMessage('対象店舗が見つかりません。');
          return;
        }

        setForm(toAdminStoreFormValues(store));
      } catch {
        setErrorMessage('通信エラーが発生しました。時間をおいて再試行してください。');
      } finally {
        setIsLoading(false);
      }
    };

    void loadStore();
  }, [mode, storeId]);

  const handleChange = (key: keyof AdminStoreFormValues, value: string | boolean) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    const converted = buildAdminStorePayload(form);
    if (!converted.ok) {
      setErrorMessage(converted.message);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(mode === 'create' ? '/api/admin/stores' : `/api/admin/stores/${storeId}`, {
        method: mode === 'create' ? 'POST' : 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(converted.payload),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) {
        setErrorMessage(parseErrorMessage(payload, '保存に失敗しました。'));
        return;
      }

      router.push('/admin/stores');
      router.refresh();
    } catch {
      setErrorMessage('通信エラーが発生しました。時間をおいて再試行してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const title = useMemo(() => buildTitle(mode), [mode]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-text">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold text-main-strong">{title}</h1>
        <p className="mt-2 text-sm text-text/70">管理者向けの店舗情報編集画面です。</p>

        {isLoading ? (
          <p className="mt-6 text-sm text-text/70">店舗情報を読み込み中です...</p>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm">
              店名（必須）
              <input
                className="rounded-md border border-border bg-base px-3 py-2"
                value={form.name}
                onChange={(event) => handleChange('name', event.target.value)}
              />
            </label>

            <label className="grid gap-1 text-sm">
              住所
              <input
                className="rounded-md border border-border bg-base px-3 py-2"
                value={form.address}
                onChange={(event) => handleChange('address', event.target.value)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                市区町村（必須）
                <input
                  className="rounded-md border border-border bg-base px-3 py-2"
                  value={form.city}
                  onChange={(event) => handleChange('city', event.target.value)}
                />
              </label>

              <label className="grid gap-1 text-sm">
                ジャンル（必須）
                <input
                  className="rounded-md border border-border bg-base px-3 py-2"
                  value={form.genre}
                  onChange={(event) => handleChange('genre', event.target.value)}
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              予約URL（必須）
              <input
                className="rounded-md border border-border bg-base px-3 py-2"
                value={form.reservationUrl}
                onChange={(event) => handleChange('reservationUrl', event.target.value)}
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1 text-sm">
                緯度
                <input
                  className="rounded-md border border-border bg-base px-3 py-2"
                  value={form.latitude}
                  onChange={(event) => handleChange('latitude', event.target.value)}
                />
              </label>

              <label className="grid gap-1 text-sm">
                経度
                <input
                  className="rounded-md border border-border bg-base px-3 py-2"
                  value={form.longitude}
                  onChange={(event) => handleChange('longitude', event.target.value)}
                />
              </label>
            </div>

            <label className="grid gap-1 text-sm">
              画像URL（1行1URL、最大10件）
              <textarea
                className="min-h-28 rounded-md border border-border bg-base px-3 py-2"
                value={form.imageUrlsText}
                onChange={(event) => handleChange('imageUrlsText', event.target.value)}
              />
            </label>

            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(event) => handleChange('isPublished', event.target.checked)}
              />
              公開する
            </label>

            {errorMessage ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center rounded-lg bg-main px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {isSubmitting ? '保存中...' : '保存する'}
              </button>
              <Link
                href="/admin/stores"
                className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text"
              >
                一覧へ戻る
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
