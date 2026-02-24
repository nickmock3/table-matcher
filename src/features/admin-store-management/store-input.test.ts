import { describe, expect, it } from 'vitest';
import { adminStoreCreateSchema, adminStoreUpdateSchema, serializeImageUrls } from './store-input';

describe('adminStoreCreateSchema', () => {
  it('必須項目が揃っている場合は検証成功する', () => {
    const result = adminStoreCreateSchema.safeParse({
      name: '和食処 さくら',
      city: '新宿区',
      genre: '和食',
      reservationUrl: 'https://example.com/reserve/3',
      imageUrls: ['https://example.com/a.jpg'],
      isPublished: true,
    });

    expect(result.success).toBe(true);
  });

  it('必須項目不足の場合は検証失敗する', () => {
    const result = adminStoreCreateSchema.safeParse({
      city: '新宿区',
      genre: '和食',
      reservationUrl: 'https://example.com/reserve/3',
    });

    expect(result.success).toBe(false);
  });

  it('緯度経度が片方のみの場合は検証失敗する', () => {
    const result = adminStoreCreateSchema.safeParse({
      name: '和食処 さくら',
      city: '新宿区',
      genre: '和食',
      reservationUrl: 'https://example.com/reserve/3',
      latitude: 35.68,
    });

    expect(result.success).toBe(false);
  });
});

describe('adminStoreUpdateSchema', () => {
  it('更新項目が一部のみでも検証成功する', () => {
    const result = adminStoreUpdateSchema.safeParse({
      isPublished: false,
    });

    expect(result.success).toBe(true);
  });
});

describe('serializeImageUrls', () => {
  it('未指定または空配列の場合はnullを返す', () => {
    expect(serializeImageUrls(undefined)).toBeNull();
    expect(serializeImageUrls([])).toBeNull();
  });

  it('画像配列をJSON文字列に変換する', () => {
    expect(serializeImageUrls(['https://example.com/a.jpg', 'https://example.com/b.jpg'])).toBe(
      '["https://example.com/a.jpg","https://example.com/b.jpg"]',
    );
  });
});
