'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { authClient } from '@/lib/auth/client';

const callbackPath = '/shop/seat-status';

const parseErrorMessage = (value: unknown, fallback: string): string => {
  if (typeof value === 'object' && value !== null) {
    const message = (value as { message?: unknown }).message;
    if (typeof message === 'string' && message.length > 0) {
      return message;
    }
  }
  return fallback;
};

const buildTroubleshootingHint = (message: string): string | null => {
  if (message.includes('Invalid origin')) {
    return 'APP_BASE_URL と Google OAuth の Origin / Redirect URI を同一URLで揃えてください。';
  }
  if (message.includes('Auth is not available in this runtime')) {
    return '`bun run dev:cf` で起動し、Cloudflareバインディングを有効化してください。';
  }
  if (message.includes('redirect_uri_mismatch')) {
    return 'Google Cloud Console の Redirect URI 登録値が実行URLと一致しているか確認してください。';
  }
  return null;
};

export function ShopAuthPageContent() {
  const sessionState = authClient.useSession();
  const [actionError, setActionError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const sessionUser = useMemo(() => sessionState.data?.user ?? null, [sessionState.data]);
  const sessionErrorMessage = useMemo(() => {
    return parseErrorMessage(sessionState.error, '');
  }, [sessionState.error]);
  const combinedErrorMessage = actionError ?? sessionErrorMessage;
  const troubleshootingHint = combinedErrorMessage ? buildTroubleshootingHint(combinedErrorMessage) : null;

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: callbackPath,
      });

      if (result?.error) {
        setActionError(parseErrorMessage(result.error, 'ログインに失敗しました。設定を確認して再試行してください。'));
      }
    } catch {
      setActionError('ログインに失敗しました。設定を確認して再試行してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    setIsSubmitting(true);
    setActionError(null);

    try {
      const result = await authClient.signOut();
      if (result?.error) {
        setActionError(parseErrorMessage(result.error, 'ログアウトに失敗しました。時間をおいて再試行してください。'));
      } else {
        await sessionState.refetch();
      }
    } catch {
      setActionError('ログアウトに失敗しました。時間をおいて再試行してください。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen w-full max-w-3xl px-6 py-10 text-text">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold text-main-strong">店舗ユーザー / 管理者ログイン</h1>
        <p className="mt-2 text-sm text-text/70">
          公開画面はログイン不要です。店舗更新機能と管理機能はGoogleログインが必要です。
        </p>

        <section className="mt-6 rounded-lg border border-border bg-base p-4 text-sm">
          <h2 className="font-semibold text-text/80">現在のセッション状態</h2>
          {sessionState.isPending ? (
            <p className="mt-2 text-text/70">セッションを確認中です...</p>
          ) : sessionUser ? (
            <div className="mt-2 space-y-1">
              <p>ログイン済みです。</p>
              <p className="text-text/70">メール: {sessionUser.email}</p>
              <p className="text-text/70">名前: {sessionUser.name ?? '-'}</p>
            </div>
          ) : (
            <p className="mt-2 text-text/70">未ログインです。</p>
          )}
        </section>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg bg-main px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            Googleでログイン
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSubmitting}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text disabled:cursor-not-allowed disabled:opacity-60"
          >
            ログアウト
          </button>
          <Link
            href={callbackPath}
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text"
          >
            店舗更新画面へ
          </Link>
          <Link
            href="/admin/stores"
            className="inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-semibold text-text"
          >
            管理者店舗管理へ
          </Link>
        </div>

        {combinedErrorMessage ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{combinedErrorMessage}</p>
            {troubleshootingHint ? <p className="mt-1">{troubleshootingHint}</p> : null}
            <button
              type="button"
              className="mt-2 inline-flex underline"
              onClick={() => {
                void sessionState.refetch();
              }}
            >
              セッションを再確認
            </button>
          </div>
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
