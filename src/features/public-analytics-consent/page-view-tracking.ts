import { parseAnalyticsConsentResponse, type AnalyticsConsentStatus } from '@/features/public-analytics-consent/consent-model';

export const PAGE_VIEW_SESSION_STORAGE_KEY = 'tm_page_view_session_id';

export type PageViewTrackPayload = {
  storeId?: string;
  path: string;
  sessionId: string;
  occurredAt: number;
};

export const shouldTrackPublicPath = (pathname: string): boolean => {
  return pathname === '/' || /^\/stores\/[^/]+$/.test(pathname);
};

export const extractStoreIdFromPath = (pathname: string): string | undefined => {
  const matched = pathname.match(/^\/stores\/([^/]+)$/);
  return matched?.[1];
};

const generateSessionId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `session-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const resolvePageViewSessionId = (): string => {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  const existing = window.sessionStorage.getItem(PAGE_VIEW_SESSION_STORAGE_KEY);
  if (existing && existing.length >= 8) {
    return existing;
  }

  const next = generateSessionId();
  window.sessionStorage.setItem(PAGE_VIEW_SESSION_STORAGE_KEY, next);
  return next;
};

export const fetchConsentStatusForTracking = async (): Promise<AnalyticsConsentStatus | null> => {
  const response = await fetch('/api/public/analytics/consent', {
    method: 'GET',
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    return null;
  }

  return parseAnalyticsConsentResponse(payload);
};

export const sendPageViewEvent = async (payload: PageViewTrackPayload): Promise<void> => {
  const body = JSON.stringify(payload);

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const sent = navigator.sendBeacon(
      '/api/public/analytics/page-view',
      new Blob([body], { type: 'application/json' }),
    );
    if (sent) {
      return;
    }
  }

  await fetch('/api/public/analytics/page-view', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  });
};
