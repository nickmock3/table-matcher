const ANON_ID_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const ANALYTICS_ANON_ID_COOKIE_NAME = 'tm_anon_id';

const parseCookieHeader = (cookieHeader: string | null): Record<string, string> => {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0)
    .reduce<Record<string, string>>((acc, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex <= 0) {
        return acc;
      }

      const key = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
};

const isReasonableAnonId = (value: string | undefined): value is string => {
  if (!value) {
    return false;
  }

  return value.length >= 16 && value.length <= 128;
};

export const resolveAnalyticsAnonIdFromRequest = (request: Request): {
  anonId: string | null;
  shouldSetCookie: boolean;
  wasGenerated: boolean;
} => {
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  const existing = cookies[ANALYTICS_ANON_ID_COOKIE_NAME];
  if (isReasonableAnonId(existing)) {
    return {
      anonId: existing,
      shouldSetCookie: false,
      wasGenerated: false,
    };
  }

  return {
    anonId: null,
    shouldSetCookie: false,
    wasGenerated: false,
  };
};

export const resolveOrCreateAnalyticsAnonIdFromRequest = (request: Request): {
  anonId: string;
  shouldSetCookie: boolean;
  wasGenerated: boolean;
} => {
  const cookies = parseCookieHeader(request.headers.get('cookie'));
  const existing = cookies[ANALYTICS_ANON_ID_COOKIE_NAME];
  if (isReasonableAnonId(existing)) {
    return {
      anonId: existing,
      shouldSetCookie: false,
      wasGenerated: false,
    };
  }

  return {
    anonId: crypto.randomUUID(),
    shouldSetCookie: true,
    wasGenerated: true,
  };
};

export const buildAnalyticsAnonIdSetCookie = (anonId: string): string => {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${ANALYTICS_ANON_ID_COOKIE_NAME}=${encodeURIComponent(anonId)}; Path=/; Max-Age=${ANON_ID_COOKIE_MAX_AGE_SECONDS}; HttpOnly; SameSite=Lax${secure}`;
};
