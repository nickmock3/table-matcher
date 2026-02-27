import { eq } from 'drizzle-orm';

import { resolveAnalyticsAnonIdFromRequest } from '@/features/public-analytics-consent/consent-cookie';
import {
  buildPageViewDedupeKey,
  normalizePageViewPayload,
  pageViewPayloadSchema,
} from '@/features/public-analytics-consent/page-view-input';
import { getDrizzleDb } from '@/lib/db/client';
import { analyticsConsents, pageViewEvents, stores } from '@/lib/db/schema';

export async function POST(request: Request) {
  try {
    const anon = resolveAnalyticsAnonIdFromRequest(request);
    if (!anon.anonId) {
      return Response.json({ ok: true, tracked: false, reason: 'consent_undecided' }, { status: 202 });
    }

    const db = await getDrizzleDb();
    const consentRows = await db
      .select({ status: analyticsConsents.status })
      .from(analyticsConsents)
      .where(eq(analyticsConsents.anonId, anon.anonId))
      .limit(1);

    if (consentRows[0]?.status !== 'accepted') {
      return Response.json({ ok: true, tracked: false, reason: 'consent_rejected' }, { status: 202 });
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ ok: false, message: 'Invalid input' }, { status: 400 });
    }

    const parsed = pageViewPayloadSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ ok: false, message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
    }

    const normalized = normalizePageViewPayload(parsed.data);
    if (normalized.storeId) {
      const storeRows = await db
        .select({ id: stores.id })
        .from(stores)
        .where(eq(stores.id, normalized.storeId))
        .limit(1);

      if (!storeRows[0]) {
        return Response.json({ ok: false, message: 'Invalid input', issues: ['Invalid storeId'] }, { status: 400 });
      }
    }

    const dedupeKey = buildPageViewDedupeKey({
      anonId: anon.anonId,
      storeId: normalized.storeId,
      path: normalized.path,
      occurredAt: normalized.occurredAt,
    });
    const now = Math.floor(Date.now() / 1000);

    await db
      .insert(pageViewEvents)
      .values({
        id: crypto.randomUUID(),
        storeId: normalized.storeId,
        path: normalized.path,
        anonId: anon.anonId,
        sessionId: normalized.sessionId,
        occurredAt: normalized.occurredAt,
        dedupeKey,
        createdAt: now,
      })
      .onConflictDoNothing({ target: pageViewEvents.dedupeKey });

    return Response.json({ ok: true, tracked: true }, { status: 200 });
  } catch {
    return Response.json({ ok: false, message: 'Failed to track page view' }, { status: 500 });
  }
}
