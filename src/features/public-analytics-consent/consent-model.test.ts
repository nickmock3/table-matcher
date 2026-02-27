import { describe, expect, it } from 'vitest';

import {
  isPublicPagePath,
  parseAnalyticsConsentResponse,
  parseAnalyticsConsentStatus,
  shouldShowConsentBanner,
} from './consent-model';

describe('isPublicPagePath', () => {
  it('公開ページはtrueになる', () => {
    expect(isPublicPagePath('/')).toBe(true);
    expect(isPublicPagePath('/stores/store-1')).toBe(true);
  });

  it('管理画面・店舗画面・APIはfalseになる', () => {
    expect(isPublicPagePath('/admin/stores')).toBe(false);
    expect(isPublicPagePath('/shop/images')).toBe(false);
    expect(isPublicPagePath('/api/public/analytics/consent')).toBe(false);
  });
});

describe('parseAnalyticsConsentStatus', () => {
  it('有効なstatusを返す', () => {
    expect(parseAnalyticsConsentStatus('accepted')).toBe('accepted');
    expect(parseAnalyticsConsentStatus('rejected')).toBe('rejected');
    expect(parseAnalyticsConsentStatus('undecided')).toBe('undecided');
  });

  it('不正なstatusはnullになる', () => {
    expect(parseAnalyticsConsentStatus('allow')).toBeNull();
    expect(parseAnalyticsConsentStatus(null)).toBeNull();
  });
});

describe('parseAnalyticsConsentResponse', () => {
  it('有効レスポンスを解析できる', () => {
    expect(parseAnalyticsConsentResponse({ ok: true, status: 'accepted' })).toBe('accepted');
  });

  it('無効レスポンスはnullになる', () => {
    expect(parseAnalyticsConsentResponse({ ok: false, status: 'accepted' })).toBeNull();
    expect(parseAnalyticsConsentResponse({ ok: true, status: 'invalid' })).toBeNull();
    expect(parseAnalyticsConsentResponse(null)).toBeNull();
  });
});

describe('shouldShowConsentBanner', () => {
  it('読み込み中は表示しない', () => {
    expect(
      shouldShowConsentBanner({
        status: 'undecided',
        isLoading: true,
        isSettingsOpen: false,
      }),
    ).toBe(false);
  });

  it('未確定時は表示する', () => {
    expect(
      shouldShowConsentBanner({
        status: 'undecided',
        isLoading: false,
        isSettingsOpen: false,
      }),
    ).toBe(true);
  });

  it('設定再表示時は表示する', () => {
    expect(
      shouldShowConsentBanner({
        status: 'accepted',
        isLoading: false,
        isSettingsOpen: true,
      }),
    ).toBe(true);
  });
});
