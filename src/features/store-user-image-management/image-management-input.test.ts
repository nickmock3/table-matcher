import { describe, expect, it } from 'vitest';
import {
  listRemovedImageUrls,
  parseImageUrls,
  serializeImageUrls,
  shopStoreImageUpdateSchema,
  storeImageUrlsSchema,
} from './image-management-input';

describe('storeImageUrlsSchema', () => {
  it('1-10件のURL配列を受け付ける', () => {
    const result = storeImageUrlsSchema.safeParse([
      'https://example.com/a.jpg',
      'https://example.com/b.jpg',
    ]);
    expect(result.success).toBe(true);
  });

  it('0件はエラーになる', () => {
    const result = storeImageUrlsSchema.safeParse([]);
    expect(result.success).toBe(false);
  });

  it('11件はエラーになる', () => {
    const result = storeImageUrlsSchema.safeParse(
      Array.from({ length: 11 }, (_, index) => `https://example.com/${index}.jpg`),
    );
    expect(result.success).toBe(false);
  });

  it('重複URLはエラーになる', () => {
    const result = storeImageUrlsSchema.safeParse([
      'https://example.com/a.jpg',
      'https://example.com/a.jpg',
    ]);
    expect(result.success).toBe(false);
  });

  it('https以外はエラーになる（localhost例外を除く）', () => {
    const result = storeImageUrlsSchema.safeParse(['http://example.com/a.jpg']);
    expect(result.success).toBe(false);
  });

  it('localhostのhttpは許可する', () => {
    const result = storeImageUrlsSchema.safeParse(['http://127.0.0.1:3100/api/store-images/stores%2F1%2Fa.jpg']);
    expect(result.success).toBe(true);
  });
});

describe('shopStoreImageUpdateSchema', () => {
  it('storeId省略でも有効', () => {
    const result = shopStoreImageUpdateSchema.safeParse({
      imageUrls: ['https://example.com/a.jpg'],
    });
    expect(result.success).toBe(true);
  });
});

describe('image urls serialization', () => {
  it('JSON変換して元に戻せる', () => {
    const raw = serializeImageUrls(['https://example.com/a.jpg']);
    expect(parseImageUrls(raw)).toEqual(['https://example.com/a.jpg']);
  });

  it('不正JSONは空配列になる', () => {
    expect(parseImageUrls('{"bad":true}')).toEqual([]);
  });

  it('削除対象URLを抽出できる', () => {
    const removed = listRemovedImageUrls(
      ['https://example.com/a.jpg', 'https://example.com/b.jpg'],
      ['https://example.com/b.jpg'],
    );
    expect(removed).toEqual(['https://example.com/a.jpg']);
  });
});
