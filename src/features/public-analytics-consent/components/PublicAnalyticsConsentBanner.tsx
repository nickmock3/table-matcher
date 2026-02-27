'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  isPublicPagePath,
  parseAnalyticsConsentResponse,
  shouldShowConsentBanner,
  type AnalyticsConsentStatus,
} from '@/features/public-analytics-consent/consent-model';

async function fetchConsentStatus(): Promise<AnalyticsConsentStatus | null> {
  const response = await fetch('/api/public/analytics/consent', {
    method: 'GET',
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return null;
  }

  return parseAnalyticsConsentResponse(payload);
}

async function saveConsentStatus(status: 'accepted' | 'rejected'): Promise<boolean> {
  const response = await fetch('/api/public/analytics/consent', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  return response.ok;
}

export function PublicAnalyticsConsentBanner() {
  const pathname = usePathname();
  const [status, setStatus] = useState<AnalyticsConsentStatus>('undecided');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isPublicPage = useMemo(() => isPublicPagePath(pathname), [pathname]);

  const loadStatus = useCallback(async () => {
    setIsLoading(true);
    try {
      const nextStatus = await fetchConsentStatus();
      setStatus(nextStatus ?? 'undecided');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPublicPage) {
      return;
    }

    void loadStatus();
  }, [isPublicPage, loadStatus]);

  const handleSelect = async (nextStatus: 'accepted' | 'rejected') => {
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    const saved = await saveConsentStatus(nextStatus);
    setIsSaving(false);

    if (!saved) {
      setErrorMessage('設定の保存に失敗しました。時間をおいて再試行してください。');
      return;
    }

    setStatus(nextStatus);
    setIsSettingsOpen(false);
  };

  if (!isPublicPage) {
    return null;
  }

  const showBanner = shouldShowConsentBanner({ status, isLoading, isSettingsOpen });

  return (
    <>
      {!showBanner ? (
        <button
          type="button"
          onClick={() => setIsSettingsOpen(true)}
          className="fixed bottom-4 right-4 z-40 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-text shadow"
        >
          解析設定
        </button>
      ) : null}

      {showBanner ? (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-main-strong">アクセス解析の設定</p>
              <p className="text-xs text-text/75">
                サービス改善と広告分配のため、閲覧データを収集します。設定は後で変更できます。
              </p>
              {errorMessage ? <p className="text-xs font-semibold text-red-700">{errorMessage}</p> : null}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsSettingsOpen(false);
                }}
                disabled={status === 'undecided' || isSaving}
                className="rounded-md border border-border bg-base px-3 py-1.5 text-xs font-semibold text-text disabled:cursor-not-allowed disabled:opacity-50"
              >
                閉じる
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSelect('rejected');
                }}
                disabled={isSaving}
                className="rounded-md border border-border bg-base px-3 py-1.5 text-xs font-semibold text-text"
              >
                同意しない
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleSelect('accepted');
                }}
                disabled={isSaving}
                className="rounded-md bg-main px-3 py-1.5 text-xs font-semibold text-white"
              >
                同意する
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
