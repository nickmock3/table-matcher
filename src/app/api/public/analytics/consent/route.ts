import { eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  buildAnalyticsAnonIdSetCookie,
  resolveOrCreateAnalyticsAnonIdFromRequest,
  resolveAnalyticsAnonIdFromRequest,
} from '@/features/public-analytics-consent/consent-cookie';
import { getDrizzleDb } from '@/lib/db/client';
import { analyticsConsents } from '@/lib/db/schema';

const putRequestSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

const withAnonCookieIfNeeded = (
  response: Response,
  params: { shouldSetCookie: boolean; anonId: string | null },
): Response => {
  if (!params.shouldSetCookie || !params.anonId) {
    return response;
  }

  response.headers.set('Set-Cookie', buildAnalyticsAnonIdSetCookie(params.anonId));
  return response;
};

export async function GET(request: Request) {
  try {
    const anon = resolveAnalyticsAnonIdFromRequest(request);
    if (!anon.anonId) {
      return Response.json({ ok: true, status: 'undecided' }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }

    const db = await getDrizzleDb();
    const rows = await db
      .select({ status: analyticsConsents.status })
      .from(analyticsConsents)
      .where(eq(analyticsConsents.anonId, anon.anonId))
      .limit(1);

    const status = rows[0]?.status ?? 'undecided';

    return withAnonCookieIfNeeded(
      Response.json({ ok: true, status }, { status: 200, headers: { 'Cache-Control': 'no-store' } }),
      anon,
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to load analytics consent' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const anon = resolveOrCreateAnalyticsAnonIdFromRequest(request);

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ ok: false, message: 'Invalid input' }, { status: 400 });
    }

    const parsed = putRequestSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ ok: false, message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    const db = await getDrizzleDb();

    await db
      .insert(analyticsConsents)
      .values({
        anonId: anon.anonId,
        status: parsed.data.status,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: analyticsConsents.anonId,
        set: {
          status: parsed.data.status,
          updatedAt: now,
        },
      });

    return withAnonCookieIfNeeded(
      Response.json({ ok: true, status: parsed.data.status }, { status: 200, headers: { 'Cache-Control': 'no-store' } }),
      anon,
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to update analytics consent' }, { status: 500 });
  }
}
