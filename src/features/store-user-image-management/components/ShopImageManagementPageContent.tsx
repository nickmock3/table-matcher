'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type DragEvent } from 'react';
import {
  canSaveImageUrls,
  parseShopImageManagementState,
  removeImageUrlAt,
  reorderImageUrls,
  type ShopImageManagementState,
} from '@/features/store-user-image-management/shop-image-management-view';

const MAX_IMAGES = 10;

function parseErrorMessage(payload: unknown, fallbackMessage: string): string {
  if (typeof payload !== 'object' || payload === null) {
    return fallbackMessage;
  }

  const message = (payload as { message?: unknown }).message;
  return typeof message === 'string' && message.length > 0 ? message : fallbackMessage;
}

export function ShopImageManagementPageContent() {
  const [state, setState] = useState<ShopImageManagementState | null>(null);
  const [initialImageUrls, setInitialImageUrls] = useState<string[]>([]);
  const [draftImageUrls, setDraftImageUrls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/shop/images', { method: 'GET' });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setState(null);
        setErrorMessage(parseErrorMessage(payload, '画像一覧を取得できませんでした。'));
        return;
      }

      const parsed = parseShopImageManagementState(payload);
      if (!parsed) {
        setState(null);
        setErrorMessage('画像一覧レスポンスの解析に失敗しました。');
        return;
      }

      setState(parsed);
      setInitialImageUrls(parsed.imageUrls);
      setDraftImageUrls(parsed.imageUrls);
    } catch {
      setState(null);
      setErrorMessage('通信エラーが発生しました。ネットワークを確認して再試行してください。');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadImages();
  }, [loadImages]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !state || isUploading || draftImageUrls.length >= MAX_IMAGES) {
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('storeId', state.storeId);
      formData.append('file', file);

      const response = await fetch('/api/shop/images/upload', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(parseErrorMessage(payload, '画像アップロードに失敗しました。'));
        return;
      }

      const imageUrl = (payload as { imageUrl?: unknown })?.imageUrl;
      if (typeof imageUrl !== 'string' || imageUrl.length === 0) {
        setErrorMessage('アップロード結果の解析に失敗しました。');
        return;
      }

      setDraftImageUrls((previous) => [...previous, imageUrl]);
      setSuccessMessage('画像を追加しました。保存すると公開画面へ反映されます。');
    } catch {
      setErrorMessage('通信エラーが発生しました。ネットワークを確認して再試行してください。');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    setDraftImageUrls((previous) => removeImageUrlAt(previous, index));
    setSuccessMessage(null);
  };

  const handleDragStart = (index: number) => {
    setDraggingIndex(index);
  };

  const handleDrop = (event: DragEvent<HTMLLIElement>, dropIndex: number) => {
    event.preventDefault();
    if (draggingIndex === null) {
      return;
    }

    setDraftImageUrls((previous) => reorderImageUrls(previous, draggingIndex, dropIndex));
    setDraggingIndex(null);
    setSuccessMessage(null);
  };

  const handleDragEnd = () => {
    setDraggingIndex(null);
  };

  const handleSave = async () => {
    if (!state || !canSave) {
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/shop/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          storeId: state.storeId,
          imageUrls: draftImageUrls,
        }),
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        setErrorMessage(parseErrorMessage(payload, '画像の保存に失敗しました。'));
        return;
      }

      const cleanupPending = (payload as { cleanupPending?: unknown })?.cleanupPending === true;
      setInitialImageUrls(draftImageUrls);
      setSuccessMessage(
        cleanupPending
          ? '保存は完了しました。削除画像の後処理が保留中です。'
          : '保存しました。公開画面に反映されます。',
      );
    } catch {
      setErrorMessage('通信エラーが発生しました。ネットワークを確認して再試行してください。');
    } finally {
      setIsSaving(false);
    }
  };

  const canSave = useMemo(
    () =>
      canSaveImageUrls({
        initialImageUrls,
        draftImageUrls,
        isLoading,
        isSubmitting: isSaving || isUploading,
      }),
    [draftImageUrls, initialImageUrls, isLoading, isSaving, isUploading],
  );

  const storeName = state?.storeName ?? '店舗名未設定';

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl px-6 py-10 text-text">
      <div className="rounded-xl border border-border bg-surface p-6">
        <h1 className="text-2xl font-semibold text-main-strong">店舗画像の管理</h1>
        <p className="mt-2 text-sm text-text/70">画像を追加・削除・並び替えして保存します（1〜10枚）。</p>

        {isLoading ? (
          <p className="mt-6 text-sm text-text/70">画像情報を読み込み中です...</p>
        ) : (
          <>
            <section className="mt-6 rounded-lg border border-border bg-base p-4">
              <h2 className="text-sm font-semibold text-text/80">対象店舗</h2>
              <p className="mt-2 text-sm">{storeName}</p>
              <p className="text-xs text-text/60">{state?.storeId ?? '-'}</p>
            </section>

            <section className="mt-4 rounded-lg border border-border bg-base p-4">
              <h2 className="text-sm font-semibold text-text/80">画像一覧</h2>
              <p className="mt-1 text-xs text-text/60">ドラッグ&ドロップで並び順を変更できます。</p>

              {draftImageUrls.length === 0 ? (
                <p className="mt-4 text-sm text-text/70">画像がありません。1枚以上アップロードしてください。</p>
              ) : (
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {draftImageUrls.map((imageUrl, index) => (
                    <li
                      key={`${imageUrl}-${index}`}
                      draggable
                      onDragStart={() => handleDragStart(index)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => handleDrop(event, index)}
                      onDragEnd={handleDragEnd}
                      className={`rounded-md border bg-surface p-3 ${
                        draggingIndex === index ? 'border-main-strong' : 'border-border'
                      }`}
                    >
                      <div className="overflow-hidden rounded-md border border-border bg-base">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={`店舗画像 ${index + 1}`}
                          className="h-40 w-full object-cover"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-xs text-text/70">{index + 1}枚目</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="rounded-md border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-700"
                        >
                          削除
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-4">
                <label className="inline-flex cursor-pointer items-center rounded-md border border-main bg-main/10 px-3 py-2 text-sm font-medium text-main-strong">
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleUpload}
                    disabled={isUploading || draftImageUrls.length >= MAX_IMAGES}
                    className="hidden"
                  />
                  {isUploading ? 'アップロード中...' : '画像をアップロード'}
                </label>
                <p className="mt-2 text-xs text-text/60">
                  枚数: {draftImageUrls.length}/{MAX_IMAGES}
                </p>
              </div>
            </section>
          </>
        )}

        <button
          type="button"
          onClick={handleSave}
          disabled={!canSave}
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? '保存中...' : '変更を保存する'}
        </button>

        {errorMessage ? (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <p>{errorMessage}</p>
            {errorMessage === 'Unauthorized' ? (
              <Link className="mt-2 inline-flex text-sm underline" href="/shop/login">
                ログイン画面へ
              </Link>
            ) : null}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            <p>{successMessage}</p>
          </div>
        ) : null}

        <div className="mt-6 flex items-center justify-between">
          <Link className="text-sm underline decoration-main hover:text-main-strong" href="/shop/seat-status">
            空席更新画面へ
          </Link>
          <Link className="text-sm underline decoration-main hover:text-main-strong" href="/">
            トップへ戻る
          </Link>
        </div>
      </div>
    </main>
  );
}
