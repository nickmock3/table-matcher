import { describe, expect, it } from 'vitest';

import { extractStoreIdFromPath, shouldTrackPublicPath } from './page-view-tracking';

describe('shouldTrackPublicPath', () => {
  it('公開トップと店舗詳細を追跡対象にする', () => {
    expect(shouldTrackPublicPath('/')).toBe(true);
    expect(shouldTrackPublicPath('/stores/store-1')).toBe(true);
  });

  it('管理画面や店舗画面を追跡対象外にする', () => {
    expect(shouldTrackPublicPath('/admin/stores')).toBe(false);
    expect(shouldTrackPublicPath('/shop/images')).toBe(false);
    expect(shouldTrackPublicPath('/api/health')).toBe(false);
  });
});

describe('extractStoreIdFromPath', () => {
  it('店舗詳細パスからstoreIdを抽出できる', () => {
    expect(extractStoreIdFromPath('/stores/store-1')).toBe('store-1');
  });

  it('店舗詳細以外ではundefinedを返す', () => {
    expect(extractStoreIdFromPath('/')).toBeUndefined();
    expect(extractStoreIdFromPath('/stores/store-1/images')).toBeUndefined();
  });
});
