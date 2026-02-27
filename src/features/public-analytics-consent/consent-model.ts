export type AnalyticsConsentStatus = 'accepted' | 'rejected' | 'undecided';

export const isPublicPagePath = (pathname: string): boolean => {
  return !pathname.startsWith('/admin') && !pathname.startsWith('/shop') && !pathname.startsWith('/api');
};

export const parseAnalyticsConsentStatus = (value: unknown): AnalyticsConsentStatus | null => {
  if (value === 'accepted' || value === 'rejected' || value === 'undecided') {
    return value;
  }

  return null;
};

export const parseAnalyticsConsentResponse = (payload: unknown): AnalyticsConsentStatus | null => {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const data = payload as { ok?: unknown; status?: unknown };
  if (data.ok !== true) {
    return null;
  }

  return parseAnalyticsConsentStatus(data.status);
};

export const shouldShowConsentBanner = (params: {
  status: AnalyticsConsentStatus;
  isLoading: boolean;
  isSettingsOpen: boolean;
}): boolean => {
  if (params.isLoading) {
    return false;
  }

  return params.isSettingsOpen || params.status === 'undecided';
};
