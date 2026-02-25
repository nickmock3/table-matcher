import { describe, expect, it } from 'vitest';
import {
  canSaveImageUrls,
  parseShopImageManagementState,
  removeImageUrlAt,
  reorderImageUrls,
} from './shop-image-management-view';

describe('parseShopImageManagementState', () => {
  it('有効なレスポンスを状態へ変換できる', () => {
    const state = parseShopImageManagementState({
      ok: true,
      storeId: 'store-1',
      storeName: 'テスト店舗',
      imageUrls: ['https://example.com/a.jpg'],
    });

    expect(state).toEqual({
      storeId: 'store-1',
      storeName: 'テスト店舗',
      imageUrls: ['https://example.com/a.jpg'],
    });
  });

  it('不正なレスポンスはnullになる', () => {
    const state = parseShopImageManagementState({
      ok: true,
      storeId: 1,
      imageUrls: ['https://example.com/a.jpg'],
    });
    expect(state).toBeNull();
  });
});

describe('reorderImageUrls', () => {
  it('指定インデックスへ並び替えできる', () => {
    const reordered = reorderImageUrls(
      ['https://example.com/a.jpg', 'https://example.com/b.jpg', 'https://example.com/c.jpg'],
      0,
      2,
    );

    expect(reordered).toEqual([
      'https://example.com/b.jpg',
      'https://example.com/c.jpg',
      'https://example.com/a.jpg',
    ]);
  });
});

describe('removeImageUrlAt', () => {
  it('指定画像を削除できる', () => {
    const removed = removeImageUrlAt(['https://example.com/a.jpg', 'https://example.com/b.jpg'], 0);
    expect(removed).toEqual(['https://example.com/b.jpg']);
  });
});

describe('canSaveImageUrls', () => {
  it('差分がない場合はfalse', () => {
    expect(
      canSaveImageUrls({
        initialImageUrls: ['https://example.com/a.jpg'],
        draftImageUrls: ['https://example.com/a.jpg'],
        isLoading: false,
        isSubmitting: false,
      }),
    ).toBe(false);
  });

  it('差分があり送信中でない場合はtrue', () => {
    expect(
      canSaveImageUrls({
        initialImageUrls: ['https://example.com/a.jpg'],
        draftImageUrls: ['https://example.com/b.jpg'],
        isLoading: false,
        isSubmitting: false,
      }),
    ).toBe(true);
  });

  it('送信中はfalse', () => {
    expect(
      canSaveImageUrls({
        initialImageUrls: ['https://example.com/a.jpg'],
        draftImageUrls: ['https://example.com/b.jpg'],
        isLoading: false,
        isSubmitting: true,
      }),
    ).toBe(false);
  });
});

