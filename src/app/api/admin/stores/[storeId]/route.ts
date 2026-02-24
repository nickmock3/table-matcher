import { eq } from 'drizzle-orm';
import { requireAdminAccess } from '@/features/admin-store-management/admin-auth';
import { adminStoreUpdateSchema, serializeImageUrls } from '@/features/admin-store-management/store-input';
import { getDrizzleDb } from '@/lib/db/client';
import { stores } from '@/lib/db/schema';

type StoreRouteContext = {
  params: Promise<{
    storeId: string;
  }>;
};

export async function PATCH(request: Request, context: StoreRouteContext) {
  try {
    const adminResult = await requireAdminAccess(request);
    if (!adminResult.ok) {
      return adminResult.response;
    }

    const { storeId } = await context.params;
    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ ok: false, message: 'Invalid input' }, { status: 400 });
    }

    const parsed = adminStoreUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ ok: false, message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
    }

    if (Object.keys(parsed.data).length === 0) {
      return Response.json({ ok: false, message: 'No update fields' }, { status: 400 });
    }

    const db = await getDrizzleDb();
    const now = Math.floor(Date.now() / 1000);
    const existing = await db.select({ id: stores.id }).from(stores).where(eq(stores.id, storeId)).limit(1);
    if (!existing[0]) {
      return Response.json({ ok: false, message: 'Store not found' }, { status: 404 });
    }

    const values: Partial<typeof stores.$inferInsert> = {
      updatedAt: now,
    };

    if (parsed.data.name !== undefined) values.name = parsed.data.name;
    if (parsed.data.address !== undefined) values.address = parsed.data.address;
    if (parsed.data.city !== undefined) values.city = parsed.data.city;
    if (parsed.data.genre !== undefined) values.genre = parsed.data.genre;
    if (parsed.data.latitude !== undefined) values.latitude = parsed.data.latitude;
    if (parsed.data.longitude !== undefined) values.longitude = parsed.data.longitude;
    if (parsed.data.imageUrls !== undefined) values.imageUrls = serializeImageUrls(parsed.data.imageUrls);
    if (parsed.data.reservationUrl !== undefined) values.reservationUrl = parsed.data.reservationUrl;
    if (parsed.data.isPublished !== undefined) values.isPublished = parsed.data.isPublished;

    await db.update(stores).set(values).where(eq(stores.id, storeId));

    return Response.json({ ok: true, storeId }, { status: 200 });
  } catch {
    return Response.json({ ok: false, message: 'Failed to update store' }, { status: 500 });
  }
}
