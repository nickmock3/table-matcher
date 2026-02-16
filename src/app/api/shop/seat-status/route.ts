import { and, desc, eq } from 'drizzle-orm';
import { z } from 'zod';

import {
  seatStatusSchema,
  updateSeatStatusForStoreUser,
  type SeatStatus,
  type SeatStatusUpdateRepository,
} from '@/features/store-vacancy-update/update-seat-status';
import { createAuth } from '@/lib/auth/server';
import { getDrizzleDb } from '@/lib/db/client';
import { seatStatusUpdates, storeUserLinks } from '@/lib/db/schema';
import { mockStoreRepository } from '@/features/top-page/data/storeRepository';

type StoreLink = {
  storeId: string;
  userId: string;
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

const resolveStoreLink = async (loginEmail: string): Promise<
  | { ok: true; link: StoreLink }
  | {
      ok: false;
      status: number;
      message: string;
    }
> => {
  const db = await getDrizzleDb();

  const links = await db
    .select({
      storeId: storeUserLinks.storeId,
      userId: storeUserLinks.userId,
    })
    .from(storeUserLinks)
    .where(eq(storeUserLinks.loginEmail, loginEmail));

  if (links.length === 0) {
    return {
      ok: false,
      status: 403,
      message: 'Linked store not found',
    };
  }

  if (links.length > 1) {
    return {
      ok: false,
      status: 409,
      message: 'Multiple linked stores found',
    };
  }

  return {
    ok: true,
    link: links[0],
  };
};

const getSessionEmail = async (
  request: Request,
): Promise<
  | {
      ok: true;
      email: string;
    }
  | {
      ok: false;
      response: Response;
    }
> => {
  const auth = await createAuth();
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user?.email) {
    return {
      ok: false,
      response: Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 }),
    };
  }

  return {
    ok: true,
    email: session.user.email,
  };
};

const resolveCurrentStatus = (latest: { status: SeatStatus; expiresAt: number } | null, nowEpoch: number) => {
  if (!latest) {
    return {
      currentStatus: 'unknown' as const,
      expiresAt: null,
      canMarkAvailable: true,
    };
  }

  if (latest.expiresAt <= nowEpoch) {
    return {
      currentStatus: 'unknown' as const,
      expiresAt: null,
      canMarkAvailable: true,
    };
  }

  if (latest.status === 'available') {
    return {
      currentStatus: 'available' as const,
      expiresAt: latest.expiresAt,
      canMarkAvailable: false,
    };
  }

  return {
    currentStatus: 'unavailable' as const,
    expiresAt: latest.expiresAt,
    canMarkAvailable: true,
  };
};

export async function GET(request: Request) {
  try {
    const sessionResult = await getSessionEmail(request);
    if (!sessionResult.ok) {
      return sessionResult.response;
    }

    const linkResult = await resolveStoreLink(sessionResult.email);
    if (!linkResult.ok) {
      return Response.json({ ok: false, message: linkResult.message }, { status: linkResult.status });
    }

    const db = await getDrizzleDb();
    const rows = await db
      .select({
        status: seatStatusUpdates.status,
        expiresAt: seatStatusUpdates.expiresAt,
      })
      .from(seatStatusUpdates)
      .where(eq(seatStatusUpdates.storeId, linkResult.link.storeId))
      .orderBy(desc(seatStatusUpdates.createdAt))
      .limit(1);

    const latest = rows[0] ?? null;
    const nowEpoch = Math.floor(Date.now() / 1000);
    const current = resolveCurrentStatus(latest, nowEpoch);
    const store = mockStoreRepository.findStoreById(linkResult.link.storeId);

    return Response.json(
      {
        ok: true,
        storeId: linkResult.link.storeId,
        storeName: store?.name ?? null,
        coverImageUrl: store?.imageUrls?.[0] ?? null,
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
    const sessionResult = await getSessionEmail(request);
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

    const linkResult = await resolveStoreLink(sessionResult.email);
    if (!linkResult.ok) {
      return Response.json({ ok: false, message: linkResult.message }, { status: linkResult.status });
    }

    if (parsed.data.storeId && parsed.data.storeId !== linkResult.link.storeId) {
      return Response.json({ ok: false, message: 'Forbidden' }, { status: 403 });
    }

    const repository = await createRepository();
    const status = parsed.data.status ?? 'available';

    const result = await updateSeatStatusForStoreUser(
      {
        loginEmail: sessionResult.email,
        storeId: linkResult.link.storeId,
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
        storeId: linkResult.link.storeId,
        status,
        expiresAt: result.expiresAt,
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to update seat status' }, { status: 500 });
  }
}
