import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/features/authz/guards';
import {
  listRemovedImageUrls,
  parseImageUrls,
  serializeImageUrls,
  shopStoreImageUpdateSchema,
} from '@/features/store-user-image-management/image-management-input';
import { requireShopImageAccess } from '@/features/store-user-image-management/shop-image-auth';
import { extractStoreImageObjectKey } from '@/features/store-user-image-management/image-storage';
import {
  listStoreImageLinks,
  resolveStoreImageScope,
} from '@/features/store-user-image-management/store-image-access';
import { tryGetCloudflareEnv } from '@/lib/cloudflare';
import { getDrizzleDb } from '@/lib/db/client';
import { stores } from '@/lib/db/schema';

const getBucketImages = async () => {
  const cfEnv = await tryGetCloudflareEnv();
  return cfEnv?.BUCKET_IMAGES ?? null;
};

export async function GET(request: Request) {
  try {
    const accessResult = await requireShopImageAccess(request, {
      requireSessionFn: requireSession,
    });
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const scopeResult = await resolveStoreImageScope(
      { loginEmail: accessResult.loginEmail },
      {
        listStoreLinks: listStoreImageLinks,
      },
    );
    if (!scopeResult.ok) {
      return scopeResult.response;
    }

    return Response.json(
      {
        ok: true,
        storeId: scopeResult.link.storeId,
        storeName: scopeResult.link.storeName,
        imageUrls: parseImageUrls(scopeResult.link.imageUrls),
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to fetch store images' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const accessResult = await requireShopImageAccess(request, {
      requireSessionFn: requireSession,
    });
    if (!accessResult.ok) {
      return accessResult.response;
    }

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return Response.json({ ok: false, message: 'Invalid input' }, { status: 400 });
    }

    const parsed = shopStoreImageUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      return Response.json({ ok: false, message: 'Invalid input', issues: parsed.error.issues }, { status: 400 });
    }

    const scopeResult = await resolveStoreImageScope(
      {
        loginEmail: accessResult.loginEmail,
        requestedStoreId: parsed.data.storeId,
      },
      { listStoreLinks: listStoreImageLinks },
    );
    if (!scopeResult.ok) {
      return scopeResult.response;
    }

    const db = await getDrizzleDb();
    const storeRows = await db
      .select({
        id: stores.id,
        imageUrls: stores.imageUrls,
      })
      .from(stores)
      .where(and(eq(stores.id, scopeResult.link.storeId)))
      .limit(1);

    const currentStore = storeRows[0];
    if (!currentStore) {
      return Response.json({ ok: false, message: 'Store not found' }, { status: 404 });
    }

    const previousImageUrls = parseImageUrls(currentStore.imageUrls);
    const nextImageUrls = parsed.data.imageUrls;
    const requestOrigin = new URL(request.url).origin;
    const previousImageUrlSet = new Set(previousImageUrls);
    const hasInvalidNewImageUrl = nextImageUrls.some((imageUrl) => {
      if (previousImageUrlSet.has(imageUrl)) {
        return false;
      }

      return extractStoreImageObjectKey(imageUrl, scopeResult.link.storeId, requestOrigin) === null;
    });

    if (hasInvalidNewImageUrl) {
      return Response.json(
        {
          ok: false,
          message: 'Only uploaded store images can be added',
        },
        { status: 400 },
      );
    }

    const removedImageUrls = listRemovedImageUrls(previousImageUrls, nextImageUrls);
    const keysToDelete = removedImageUrls
      .map((imageUrl) => extractStoreImageObjectKey(imageUrl, scopeResult.link.storeId, requestOrigin))
      .filter((key): key is string => key !== null);

    const now = Math.floor(Date.now() / 1000);
    await db
      .update(stores)
      .set({
        imageUrls: serializeImageUrls(nextImageUrls),
        updatedAt: now,
      })
      .where(eq(stores.id, scopeResult.link.storeId));

    if (keysToDelete.length > 0) {
      const bucket = await getBucketImages();
      if (!bucket) {
        return Response.json(
          { ok: true, storeId: scopeResult.link.storeId, imageUrls: nextImageUrls, cleanupPending: true },
          { status: 200 },
        );
      }

      try {
        for (const key of keysToDelete) {
          await bucket.delete(key);
        }
      } catch {
        return Response.json(
          { ok: true, storeId: scopeResult.link.storeId, imageUrls: nextImageUrls, cleanupPending: true },
          { status: 200 },
        );
      }
    }

    return Response.json(
      {
        ok: true,
        storeId: scopeResult.link.storeId,
        imageUrls: nextImageUrls,
      },
      { status: 200 },
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to update store images' }, { status: 500 });
  }
}
