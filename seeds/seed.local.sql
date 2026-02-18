-- Local development seed data for D1 (table-matcher-dev --local)
-- Safe to run repeatedly.

DELETE FROM seat_status_updates;
DELETE FROM store_user_links;
DELETE FROM users;
DELETE FROM stores;

INSERT INTO stores (
  id,
  name,
  address,
  city,
  genre,
  latitude,
  longitude,
  image_urls,
  reservation_url,
  is_published,
  created_at,
  updated_at
) VALUES
  (
    '1',
    'カフェ ブルースカイ',
    NULL,
    '渋谷区',
    'カフェ',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop"]',
    'https://example.com/reserve/1',
    1,
    strftime('%s','now'),
    strftime('%s','now')
  ),
  (
    '2',
    'イタリアン ラ・フォルトゥーナ',
    NULL,
    '港区',
    'イタリアン',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop"]',
    'https://example.com/reserve/2',
    1,
    strftime('%s','now'),
    strftime('%s','now')
  ),
  (
    '3',
    '和食処 さくら',
    '東京都新宿区西新宿2-8-1',
    '新宿区',
    '和食',
    35.6896,
    139.6917,
    '["https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=1200&h=675&fit=crop","https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1200&h=675&fit=crop","https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?w=1200&h=675&fit=crop"]',
    'https://example.com/reserve/3',
    1,
    strftime('%s','now'),
    strftime('%s','now')
  ),
  (
    '4',
    'フレンチビストロ パリ',
    NULL,
    '渋谷区',
    'フレンチ',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"]',
    'https://example.com/reserve/4',
    1,
    strftime('%s','now'),
    strftime('%s','now')
  ),
  (
    '5',
    '中華料理 龍',
    NULL,
    '品川区',
    '中華',
    NULL,
    NULL,
    '["https://images.unsplash.com/photo-1525755662778-989d0524087e?w=400&h=300&fit=crop"]',
    'https://example.com/reserve/5',
    1,
    strftime('%s','now'),
    strftime('%s','now')
  );

INSERT INTO users (
  id,
  email,
  role,
  created_at,
  updated_at
) VALUES
  (
    'shop-user-1',
    'shop-sakura@example.com',
    'shop',
    strftime('%s','now'),
    strftime('%s','now')
  ),
  (
    'shop-user-2',
    'shop-bluesky@example.com',
    'shop',
    strftime('%s','now'),
    strftime('%s','now')
  );

INSERT INTO store_user_links (
  id,
  store_id,
  user_id,
  login_email,
  created_at,
  updated_at
) VALUES
  (
    'link-1',
    '3',
    'shop-user-1',
    'shop-sakura@example.com',
    strftime('%s','now'),
    strftime('%s','now')
  ),
  (
    'link-2',
    '1',
    'shop-user-2',
    'shop-bluesky@example.com',
    strftime('%s','now'),
    strftime('%s','now')
  );
