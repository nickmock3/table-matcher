import { describe, expect, it } from 'vitest';

import {
  isMarkAvailableActionDisabled,
  parseSeatStatusState,
  resolveCurrentSeatStatus,
} from './seat-status-view';

describe('resolveCurrentSeatStatus', () => {
  it('更新履歴がない場合は未更新として扱う', () => {
    expect(resolveCurrentSeatStatus(null, 1000)).toEqual({
      currentStatus: 'unknown',
      expiresAt: null,
      canMarkAvailable: true,
    });
  });

  it('有効期限切れは未更新として扱う', () => {
    expect(resolveCurrentSeatStatus({ status: 'available', expiresAt: 999 }, 1000)).toEqual({
      currentStatus: 'unknown',
      expiresAt: null,
      canMarkAvailable: true,
    });
  });

  it('空席ありの有効レコード時は更新ボタンを無効化する', () => {
    expect(resolveCurrentSeatStatus({ status: 'available', expiresAt: 1200 }, 1000)).toEqual({
      currentStatus: 'available',
      expiresAt: 1200,
      canMarkAvailable: false,
    });
  });

  it('空席なしの有効レコード時は空席あり更新を許可する', () => {
    expect(resolveCurrentSeatStatus({ status: 'unavailable', expiresAt: 1200 }, 1000)).toEqual({
      currentStatus: 'unavailable',
      expiresAt: 1200,
      canMarkAvailable: true,
    });
  });
});

describe('parseSeatStatusState', () => {
  it('有効なレスポンスを状態へ変換できる', () => {
    const parsed = parseSeatStatusState({
      ok: true,
      storeId: 'store-1',
      storeName: 'テスト店舗',
      coverImageUrl: null,
      currentStatus: 'available',
      expiresAt: 1234,
      canMarkAvailable: false,
    });

    expect(parsed).toEqual({
      storeId: 'store-1',
      storeName: 'テスト店舗',
      coverImageUrl: null,
      currentStatus: 'available',
      expiresAt: 1234,
      canMarkAvailable: false,
    });
  });

  it('不正なレスポンスはnullになる', () => {
    const parsed = parseSeatStatusState({
      ok: true,
      storeId: 'store-1',
      currentStatus: 'busy',
      expiresAt: 1234,
      canMarkAvailable: true,
    });

    expect(parsed).toBeNull();
  });
});

describe('isMarkAvailableActionDisabled', () => {
  it('読み込み中は常に無効', () => {
    expect(
      isMarkAvailableActionDisabled({
        isLoading: true,
        isSubmitting: false,
        state: null,
      }),
    ).toBe(true);
  });

  it('更新可能で送信中でない場合のみ有効', () => {
    expect(
      isMarkAvailableActionDisabled({
        isLoading: false,
        isSubmitting: false,
        state: {
          storeId: 'store-1',
          storeName: 'テスト店舗',
          coverImageUrl: null,
          currentStatus: 'unavailable',
          expiresAt: 2000,
          canMarkAvailable: true,
        },
      }),
    ).toBe(false);

    expect(
      isMarkAvailableActionDisabled({
        isLoading: false,
        isSubmitting: false,
        state: {
          storeId: 'store-1',
          storeName: 'テスト店舗',
          coverImageUrl: null,
          currentStatus: 'available',
          expiresAt: 2000,
          canMarkAvailable: false,
        },
      }),
    ).toBe(true);
  });
});
