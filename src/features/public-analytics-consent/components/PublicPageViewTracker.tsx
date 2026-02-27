'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { isPublicPagePath } from '@/features/public-analytics-consent/consent-model';
import {
  extractStoreIdFromPath,
  fetchConsentStatusForTracking,
  resolvePageViewSessionId,
  sendPageViewEvent,
  shouldTrackPublicPath,
} from '@/features/public-analytics-consent/page-view-tracking';

export function PublicPageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isPublicPagePath(pathname) || !shouldTrackPublicPath(pathname)) {
      return;
    }

    let cancelled = false;

    const run = async () => {
      try {
        const consentStatus = await fetchConsentStatusForTracking();
        if (cancelled || consentStatus !== 'accepted') {
          return;
        }

        await sendPageViewEvent({
          storeId: extractStoreIdFromPath(pathname),
          path: pathname,
          sessionId: resolvePageViewSessionId(),
          occurredAt: Math.floor(Date.now() / 1000),
        });
      } catch {
        // Non-blocking by design for public page UX.
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
