import { describe, expect, it } from 'vitest';
import {
  buildAdminStorePayload,
  createEmptyAdminStoreFormValues,
  formatImageUrlsText,
  parseImageUrlsText,
  toAdminStoreFormValues,
  type AdminStore,
} from './admin-store-form';

describe('admin store form helpers', () => {
  it('画像URLテキストを配列に変換する', () => {
    const result = parseImageUrlsText('https://a.example/x.jpg\n\n  https://b.example/y.jpg  ');
    expect(result).toEqual(['https://a.example/x.jpg', 'https://b.example/y.jpg']);
  });

  it('画像URL配列をテキストに変換する', () => {
    expect(formatImageUrlsText(['https://a.example/x.jpg', 'https://b.example/y.jpg'])).toBe(
      'https://a.example/x.jpg\nhttps://b.example/y.jpg',
    );
  });

  it('空フォーム初期値を返す', () => {
    expect(createEmptyAdminStoreFormValues()).toEqual({
      name: '',
      address: '',
      city: '',
      genre: '',
      reservationUrl: '',
      latitude: '',
      longitude: '',
      imageUrlsText: '',
      isPublished: true,
    });
  });

  it('店舗情報からフォーム値を作成する', () => {
    const store: AdminStore = {
      id: 'store-1',
      name: '和食処 さくら',
      address: '東京都新宿区西新宿2-8-1',
      city: '新宿区',
      genre: '和食',
      latitude: 35.6896,
      longitude: 139.6917,
      imageUrls: ['https://a.example/1.jpg', 'https://a.example/2.jpg'],
      reservationUrl: 'https://example.com/reserve/1',
      isPublished: false,
      updatedAt: 1700000000,
    };

    expect(toAdminStoreFormValues(store)).toEqual({
      name: '和食処 さくら',
      address: '東京都新宿区西新宿2-8-1',
      city: '新宿区',
      genre: '和食',
      reservationUrl: 'https://example.com/reserve/1',
      latitude: '35.6896',
      longitude: '139.6917',
      imageUrlsText: 'https://a.example/1.jpg\nhttps://a.example/2.jpg',
      isPublished: false,
    });
  });

  it('フォーム値からpayloadを作成する', () => {
    const result = buildAdminStorePayload({
      name: ' 和食処 さくら ',
      address: ' ',
      city: ' 新宿区 ',
      genre: ' 和食 ',
      reservationUrl: ' https://example.com/reserve/1 ',
      latitude: '',
      longitude: '',
      imageUrlsText: 'https://a.example/1.jpg\nhttps://a.example/2.jpg',
      isPublished: true,
    });

    expect(result).toEqual({
      ok: true,
      payload: {
        name: '和食処 さくら',
        address: null,
        city: '新宿区',
        genre: '和食',
        reservationUrl: 'https://example.com/reserve/1',
        latitude: null,
        longitude: null,
        imageUrls: ['https://a.example/1.jpg', 'https://a.example/2.jpg'],
        isPublished: true,
      },
    });
  });

  it('緯度経度の片方のみ入力は失敗する', () => {
    const result = buildAdminStorePayload({
      name: '和食処 さくら',
      address: '',
      city: '新宿区',
      genre: '和食',
      reservationUrl: 'https://example.com/reserve/1',
      latitude: '35.6',
      longitude: '',
      imageUrlsText: '',
      isPublished: true,
    });

    expect(result).toEqual({
      ok: false,
      message: '緯度・経度は両方入力するか、両方空欄にしてください。',
    });
  });
});
