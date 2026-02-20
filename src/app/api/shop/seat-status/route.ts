import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  seatStatusSchema,
  updateSeatStatusForStoreUser,
  type SeatStatusUpdateRepository,
} from '@/features/store-vacancy-update/update-seat-status';
import { requireSession, requireStoreScope } from '@/features/authz/guards';
import { parseStoreImageUrls } from '@/features/store-data/store-model';
import { resolveCurrentSeatStatus } from '@/features/store-vacancy-update/seat-status-view';
import { getDrizzleDb } from '@/lib/db/client';
import { seatStatusUpdates, storeUserLinks, stores } from '@/lib/db/schema';

type StoreLink = {
  storeId: string;
  userId: string;
  storeName: string;
  storeImageUrls: string | null;
};

const postRequestSchema = z.object({
  storeId: z.string().min(1).optional(),
  status: seatStatusSchema.optional(),
});

const createRepository = async (): Promise<SeatStatusUpdateRepository> => {
  const db = await getDrizzleDb();

  return {
    findLinkedStoreUser: async ({ loginEmail, storeId }) => {
      const rows = await db
        .select({ userId: storeUserLinks.userId })
        .from(storeUserLinks)
        .where(and(eq(storeUserLinks.storeId, storeId), eq(storeUserLinks.loginEmail, loginEmail)))
        .limit(1);

      const row = rows[0];
      return row ? { storeUserId: row.userId } : null;
    },
    createSeatStatusUpdate: async ({ storeId, status, expiresAt, updatedByUserId }) => {
      await db.insert(seatStatusUpdates).values({
        id: crypto.randomUUID(),
        storeId,
        status,
        expiresAt,
        updatedByUserId,
      });
    },
  };
};

const listStoreLinks = async (loginEmail: string): Promise<readonly StoreLink[]> => {
  const db = await getDrizzleDb();

  const links = await db
    .select({
      storeId: storeUserLinks.storeId,
      userId: storeUserLinks.userId,
      storeName: stores.name,
      storeImageUrls: stores.imageUrls,
    })
    .from(storeUserLinks)
    .innerJoin(stores, eq(storeUserLinks.storeId, stores.id))
    .where(eq(storeUserLinks.loginEmail, loginEmail));

  return links;
};

export async function GET(request: Request) {
  try {
    const sessionResult = await requireSession(request);
    if (!sessionResult.ok) {
      return sessionResult.response;
    }

    const scopeResult = await requireStoreScope(
      { loginEmail: sessionResult.user.email },
      { listStoreLinks },
    );
    if (!scopeResult.ok) {
      return scopeResult.response;
    }

    const db = await getDrizzleDb();
    const rows = await db
      .select({
        status: seatStatusUpdates.status,
        expiresAt: seatStatusUpdates.expiresAt,
      })
      .from(seatStatusUpdates)
      .where(eq(seatStatusUpdates.storeId, scopeResult.link.storeId))
      .orderBy(desc(seatStatusUpdates.createdAt), desc(seatStatusUpdates.id))
      .limit(1);

    const latest = rows[0] ?? null;
    const nowEpoch = Math.floor(Date.now() / 1000);
    const current = resolveCurrentSeatStatus(latest, nowEpoch);

    return Response.json(
      {
        ok: true,
        storeId: scopeResult.link.storeId,
        storeName: scopeResult.link.storeName,
        coverImageUrl: parseStoreImageUrls(scopeResult.link.storeImageUrls)[0] ?? null,
        currentStatus: current.currentStatus,
        expiresAt: current.expiresAt,
        canMarkAvailable: current.canMarkAvailable,
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to fetch seat status' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const sessionResult = await requireSession(request);
    if (!sessionResult.ok) {
      return sessionResult.response;
    }

    let body: unknown = {};
    try {
      body = await request.json();
    } catch {
      // Allow empty body. Status defaults to "available".
    }

    const parsed = postRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          ok: false,
          message: 'Invalid input',
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const scopeResult = await requireStoreScope(
      {
        loginEmail: sessionResult.user.email,
        requestedStoreId: parsed.data.storeId,
      },
      { listStoreLinks },
    );
    if (!scopeResult.ok) {
      return scopeResult.response;
    }

    const repository = await createRepository();
    const status = parsed.data.status ?? 'available';

    const result = await updateSeatStatusForStoreUser(
      {
        loginEmail: sessionResult.user.email,
        storeId: scopeResult.link.storeId,
        status,
      },
      { repository },
    );

    if (!result.ok) {
      return Response.json({ ok: false, message: 'Forbidden' }, { status: 403 });
    }

    return Response.json(
      {
        ok: true,
        storeId: scopeResult.link.storeId,
        status,
        expiresAt: result.expiresAt,
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to update seat status' }, { status: 500 });
  }
}
