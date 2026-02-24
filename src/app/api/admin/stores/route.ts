import { desc } from 'drizzle-orm';
import { requireAdminAccess } from '@/features/admin-store-management/admin-auth';
import { adminStoreCreateSchema, serializeImageUrls } from '@/features/admin-store-management/store-input';
import { parseStoreImageUrls } from '@/features/store-data/store-model';
import { getDrizzleDb } from '@/lib/db/client';
import { stores } from '@/lib/db/schema';

export async function GET(request: Request) {
  try {
    const adminResult = await requireAdminAccess(request);
    if (!adminResult.ok) {
      return adminResult.response;
    }

    const db = await getDrizzleDb();
    const rows = await db
      .select({
        id: stores.id,
        name: stores.name,
        address: stores.address,
        city: stores.city,
        genre: stores.genre,
        latitude: stores.latitude,
        longitude: stores.longitude,
        imageUrls: stores.imageUrls,
        reservationUrl: stores.reservationUrl,
        isPublished: stores.isPublished,
        updatedAt: stores.updatedAt,
      })
      .from(stores)
      .orderBy(desc(stores.updatedAt), desc(stores.id));

    return Response.json(
      {
        ok: true,
        stores: rows.map((row) => ({
          ...row,
          imageUrls: parseStoreImageUrls(row.imageUrls),
        })),
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to list stores' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminResult = await requireAdminAccess(request);
    if (!adminResult.ok) {
      return adminResult.response;
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ ok: false, message: 'Invalid input' }, { status: 400 });
    }

    const parsed = adminStoreCreateSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ ok: false, message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
    }

    const db = await getDrizzleDb();
    const now = Math.floor(Date.now() / 1000);
    const storeId = crypto.randomUUID();

    await db.insert(stores).values({
      id: storeId,
      name: parsed.data.name,
      address: parsed.data.address ?? null,
      city: parsed.data.city,
      genre: parsed.data.genre,
      latitude: parsed.data.latitude ?? null,
      longitude: parsed.data.longitude ?? null,
      imageUrls: serializeImageUrls(parsed.data.imageUrls),
      reservationUrl: parsed.data.reservationUrl,
      isPublished: parsed.data.isPublished ?? true,
      createdAt: now,
      updatedAt: now,
    });

    return Response.json({ ok: true, storeId }, { status: 201 });
  } catch {
    return Response.json({ ok: false, message: 'Failed to create store' }, { status: 500 });
  }
}
