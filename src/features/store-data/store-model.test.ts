import { describe, expect, it } from 'vitest';

import { mapStoreRecordToStore, parseStoreImageUrls, type StoreRecord } from './store-model';

describe('parseStoreImageUrls', () => {
  it('有効なJSON配列をパースできる', () => {
    const result = parseStoreImageUrls('["https://example.com/a.jpg","https://example.com/b.jpg"]');
    expect(result).toEqual(['https://example.com/a.jpg', 'https://example.com/b.jpg']);
  });

  it('JSONが不正な場合は空配列を返す', () => {
    const result = parseStoreImageUrls('{broken-json}');
    expect(result).toEqual([]);
  });

  it('配列以外のJSONは空配列を返す', () => {
    const result = parseStoreImageUrls('{"url":"https://example.com/a.jpg"}');
    expect(result).toEqual([]);
  });

  it('文字列以外と空文字を除外する', () => {
    const result = parseStoreImageUrls('["https://example.com/a.jpg",1,"",null]');
    expect(result).toEqual(['https://example.com/a.jpg']);
  });
});

describe('mapStoreRecordToStore', () => {
  const record: StoreRecord = {
    id: 'store-1',
    name: '店舗A',
    address: '東京都渋谷区1-1-1',
    city: '渋谷区',
    genre: 'カフェ',
    latitude: 35.66,
    longitude: 139.7,
    imageUrls: '["https://example.com/a.jpg"]',
    reservationUrl: 'https://example.com/reserve/1',
    updatedAt: 1700000000,
  };

  it('レコードを画面表示用Storeへ変換する', () => {
    const result = mapStoreRecordToStore(record, 'available');

    expect(result).toEqual({
      id: 'store-1',
      name: '店舗A',
      address: '東京都渋谷区1-1-1',
      city: '渋谷区',
      genre: 'カフェ',
      reservationUrl: 'https://example.com/reserve/1',
      vacancyStatus: 'available',
      updatedAt: '2023-11-14T22:13:20.000Z',
      imageUrls: ['https://example.com/a.jpg'],
      latitude: 35.66,
      longitude: 139.7,
    });
  });

  it('任意値が欠損していても安全に変換できる', () => {
    const result = mapStoreRecordToStore(
      {
        ...record,
        address: null,
        latitude: null,
        longitude: null,
        imageUrls: null,
      },
      'unavailable',
    );

    expect(result.address).toBeUndefined();
    expect(result.imageUrls).toBeUndefined();
    expect(result.latitude).toBeUndefined();
    expect(result.longitude).toBeUndefined();
    expect(result.vacancyStatus).toBe('unavailable');
  });
});
