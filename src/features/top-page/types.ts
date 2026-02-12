/**
 * 店舗表示用型
 */
export type Store = {
  id: string;
  name: string;
  city: string;
  genre: string;
  reservationUrl: string;
  vacancyStatus: 'available' | 'unavailable';
  updatedAt: string; // ISO 8601
  imageUrl?: string; // 店舗画像URL（オプショナル）
};

/**
 * 検索条件型
 */
export type SearchFilters = {
  city: string | null; // 市区町村（null=全件）
  genre: string | null; // ジャンル（null=全件）
  vacancyOnly: boolean; // 空席のみ（初期値: true）
};
