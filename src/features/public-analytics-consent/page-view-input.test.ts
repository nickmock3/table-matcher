import { describe, expect, it } from 'vitest';

import {
  buildPageViewDedupeKey,
  normalizePageViewPayload,
  PAGE_VIEW_DEDUPE_WINDOW_SECONDS,
  pageViewPayloadSchema,
} from './page-view-input';

describe('pageViewPayloadSchema', () => {
  it('有効なpayloadを受け入れる', () => {
    const parsed = pageViewPayloadSchema.safeParse({
      storeId: 'store-1',
      path: '/stores/store-1',
      sessionId: 'session-12345678',
      occurredAt: 1770000000,
    });

    expect(parsed.success).toBe(true);
  });

  it('pathが/で始まらない場合は失敗する', () => {
    const parsed = pageViewPayloadSchema.safeParse({
      path: 'stores/store-1',
      sessionId: 'session-12345678',
      occurredAt: 1770000000,
    });

    expect(parsed.success).toBe(false);
  });

  it('sessionIdが短すぎる場合は失敗する', () => {
    const parsed = pageViewPayloadSchema.safeParse({
      path: '/stores/store-1',
      sessionId: 'short',
      occurredAt: 1770000000,
    });

    expect(parsed.success).toBe(false);
  });

  it('occurredAtがミリ秒の場合は失敗する', () => {
    const parsed = pageViewPayloadSchema.safeParse({
      path: '/stores/store-1',
      sessionId: 'session-12345678',
      occurredAt: 1770000000000,
    });

    expect(parsed.success).toBe(false);
  });
});

describe('normalizePageViewPayload', () => {
  it('query stringを除去したpathを返す', () => {
    const payload = normalizePageViewPayload({
      path: '/stores/store-1?ref=top',
      sessionId: 'session-12345678',
      occurredAt: 1770000000,
      storeId: 'store-1',
    });

    expect(payload.path).toBe('/stores/store-1');
  });
});

describe('buildPageViewDedupeKey', () => {
  it('30分バケットで同一キーを生成する', () => {
    const base = PAGE_VIEW_DEDUPE_WINDOW_SECONDS * 1000;
    const key1 = buildPageViewDedupeKey({
      anonId: 'anon-1',
      storeId: 'store-1',
      path: '/stores/store-1',
      occurredAt: base,
    });
    const key2 = buildPageViewDedupeKey({
      anonId: 'anon-1',
      storeId: 'store-1',
      path: '/stores/store-1',
      occurredAt: base + PAGE_VIEW_DEDUPE_WINDOW_SECONDS - 1,
    });

    expect(key1).toBe(key2);
  });

  it('storeId未指定時は固定プレースホルダを使う', () => {
    const key = buildPageViewDedupeKey({
      anonId: 'anon-1',
      path: '/',
      occurredAt: 1770000000,
    });

    expect(key).toContain('|-|/|');
  });
});
