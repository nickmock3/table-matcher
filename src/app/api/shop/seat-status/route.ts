import { and, eq } from "drizzle-orm";

import {
  seatStatusUpdateRequestSchema,
  updateSeatStatusForStoreUser,
  type SeatStatusUpdateRepository,
} from "@/features/store-vacancy-update/update-seat-status";
import { createAuth } from "@/lib/auth/server";
import { getDrizzleDb } from "@/lib/db/client";
import { seatStatusUpdates, storeUserLinks } from "@/lib/db/schema";

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

export async function POST(request: Request) {
  try {
    const auth = await createAuth();
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.email) {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return Response.json({ ok: false, message: "Invalid request body" }, { status: 400 });
    }

    const parsed = seatStatusUpdateRequestSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        {
          ok: false,
          message: "Invalid input",
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const repository = await createRepository();
    const result = await updateSeatStatusForStoreUser(
      {
        loginEmail: session.user.email,
        storeId: parsed.data.storeId,
        status: parsed.data.status,
      },
      { repository },
    );

    if (!result.ok) {
      return Response.json({ ok: false, message: "Forbidden" }, { status: 403 });
    }

    return Response.json(
      {
        ok: true,
        storeId: parsed.data.storeId,
        status: parsed.data.status,
        expiresAt: result.expiresAt,
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ ok: false, message: "Failed to update seat status" }, { status: 500 });
  }
}
