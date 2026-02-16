'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type CurrentStatus = 'available' | 'unavailable' | 'unknown';

type SeatStatusState = {
  storeId: string;
  storeName: string | null;
  coverImageUrl: string | null;
  currentStatus: CurrentStatus;
  expiresAt: number | null;
  canMarkAvailable: boolean;
};

function formatStatusLabel(status: CurrentStatus): string {
  if (status === 'available') return '空席あり';
  if (status === 'unavailable') return '空席なし';
  return '未更新';
}

function formatExpiresAt(expiresAt: number | null): string {
  if (!expiresAt) return '未設定';
  return new Date(expiresAt * 1000).toLocaleString('ja-JP');
}

function parseErrorMessage(payload: unknown, fallbackMessage: string): string {
  if (typeof payload !== 'object' || payload === null) {
    return fallbackMessage;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === 'string' && message.length > 0 ? message : fallbackMessage;
}

function parseState(payload: unknown): SeatStatusState | null {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const data = payload as {
    ok?: unknown;
    storeId?: unknown;
    storeName?: unknown;
    coverImageUrl?: unknown;
    currentStatus?: unknown;
    expiresAt?: unknown;
    canMarkAvailable?: unknown;
  };

  if (data.ok !== true) return null;
  if (typeof data.storeId !== 'string') return null;
  if (
    data.currentStatus !== 'available' &&
    data.currentStatus !== 'unavailable' &&
    data.currentStatus !== 'unknown'
  ) {
    return null;
  }
  if (data.expiresAt !== null && typeof data.expiresAt !== 'number') return null;
  if (typeof data.canMarkAvailable !== 'boolean') return null;
  if (data.storeName !== null && data.storeName !== undefined && typeof data.storeName !== 'string') {
    return null;
  }
  if (
    data.coverImageUrl !== null &&
    data.coverImageUrl !== undefined &&
    typeof data.coverImageUrl !== 'string'
  ) {
    return null;
  }

  return {
    storeId: data.storeId,
    storeName: data.storeName ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    currentStatus: data.currentStatus,
    expiresAt: data.expiresAt,
    canMarkAvailable: data.canMarkAvailable,
  };
}

export function SeatStatusUpdatePageContent() {
  const [state, setState] = useState<SeatStatusState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadState = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/shop/seat-status', { method: 'GET' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setState(null);
        setErrorMessage(parseErrorMessage(payload, '現在の空席状態を取得できませんでした。'));
        return;
      }

      const parsed = parseState(payload);
      if (!parsed) {
        setState(null);
        setErrorMessage('状態データの解析に失敗しました。再読み込みしてください。');
        return;
      }

      setState(parsed);
    } catch {
      setState(null);
      setErrorMessage('通信エラーが発生しました。ネットワークを確認して再試行してください。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  const handleMarkAvailable = async () => {
    if (!state?.canMarkAvailable || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/shop/seat-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'available' }),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(parseErrorMessage(payload, '更新に失敗しました。時間をおいて再試行してください。'));
        return;
      }

      await loadState();
    } catch {
      setErrorMessage('通信エラーが発生しました。ネットワークを確認して再試行してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusText = useMemo(() => {
    if (!state) return '-';
    return formatStatusLabel(state.currentStatus);
  }, [state]);

  const expiresAtText = useMemo(() => {
    if (!state) return '-';
    return formatExpiresAt(state.expiresAt);
  }, [state]);

  const actionDisabled = isLoading || isSubmitting || !state?.canMarkAvailable;

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-text">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold text-main-strong">空席状態の更新</h1>
        <p className="mt-2 text-sm text-text/70">
          店舗ユーザー向けの更新画面です。更新後の有効期限は30分です。
        </p>

        {isLoading ? (
          <p className="mt-6 text-sm text-text/70">状態を読み込み中です...</p>
        ) : (
          <section className="mt-6 rounded-lg border border-border bg-base p-4">
            <h2 className="text-sm font-semibold text-text/80">現在の空席情報</h2>
            <div className="mt-3 overflow-hidden rounded-md border border-border bg-surface">
              {state?.coverImageUrl ? (
                // Temporarily using img for flexible external placeholder URLs in MVP.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={state.coverImageUrl}
                  alt={`${state.storeName ?? state.storeId} の店舗画像`}
                  className="h-44 w-full object-cover"
                />
              ) : (
                <div className="flex h-44 items-center justify-center text-sm text-text/60">
                  店舗画像を準備中です。
                </div>
              )}
            </div>
            <dl className="mt-2 grid gap-2 text-sm">
              <div>
                <dt className="text-text/60">店舗名</dt>
                <dd>{state?.storeName ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-text/60">店舗ID</dt>
                <dd>{state?.storeId ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-text/60">空席状態</dt>
                <dd>{statusText}</dd>
              </div>
              <div>
                <dt className="text-text/60">有効期限</dt>
                <dd>{expiresAtText}</dd>
              </div>
            </dl>
          </section>
        )}

        <button
          type="button"
          onClick={handleMarkAvailable}
          disabled={actionDisabled}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? '更新中...' : '空席ありに更新する'}
        </button>

        {!isLoading && state && !state.canMarkAvailable ? (
          <p className="mt-3 text-xs text-text/70">
            現在すでに「空席あり」のため、更新ボタンは無効です。
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </p>
        ) : null}

        <div className="mt-6">
          <Link className="text-sm underline decoration-main hover:text-main-strong" href="/">
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
