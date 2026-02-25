import { requireSession } from '@/features/authz/guards';
import {
  ALLOWED_STORE_IMAGE_MIME_TYPES,
  buildStoreImageObjectKey,
  buildStoreImageUrl,
  validateStoreImageBinary,
  validateStoreImageUploadFile,
} from '@/features/store-user-image-management/image-storage';
import { requireShopImageAccess } from '@/features/store-user-image-management/shop-image-auth';
import {
  listStoreImageLinks,
  resolveStoreImageScope,
} from '@/features/store-user-image-management/store-image-access';
import { tryGetCloudflareEnv } from '@/lib/cloudflare';

const getBucketImages = async () => {
  const cfEnv = await tryGetCloudflareEnv();
  return cfEnv?.BUCKET_IMAGES ?? null;
};

export async function POST(request: Request) {
  try {
    const accessResult = await requireShopImageAccess(request, {
      requireSessionFn: requireSession,
    });
    if (!accessResult.ok) {
      return accessResult.response;
    }

    const formData = await request.formData();
    const requestedStoreId = formData.get('storeId');
    const file = formData.get('file');

    const scopeResult = await resolveStoreImageScope(
      {
        loginEmail: accessResult.loginEmail,
        requestedStoreId: typeof requestedStoreId === 'string' && requestedStoreId.length > 0 ? requestedStoreId : undefined,
      },
      { listStoreLinks: listStoreImageLinks },
    );
    if (!scopeResult.ok) {
      return scopeResult.response;
    }

    if (!(file instanceof File)) {
      return Response.json({ ok: false, message: 'File is required' }, { status: 400 });
    }

    const validation = validateStoreImageUploadFile(file);
    if (!validation.ok) {
      return Response.json({ ok: false, message: validation.message }, { status: 400 });
    }

    const mimeType = file.type as (typeof ALLOWED_STORE_IMAGE_MIME_TYPES)[number];
    const key = buildStoreImageObjectKey(scopeResult.link.storeId, mimeType);
    const body = await file.arrayBuffer();
    const binaryValidation = validateStoreImageBinary(new Uint8Array(body), mimeType);
    if (!binaryValidation.ok) {
      return Response.json({ ok: false, message: binaryValidation.message }, { status: 400 });
    }
    const bucket = await getBucketImages();

    if (!bucket) {
      return Response.json({ ok: false, message: 'Image bucket is not available' }, { status: 500 });
    }

    await bucket.put(key, body, {
      httpMetadata: {
        contentType: mimeType,
      },
    });

    const imageUrl = buildStoreImageUrl(new URL(request.url).origin, key);
    return Response.json(
      {
        ok: true,
        storeId: scopeResult.link.storeId,
        imageUrl,
        objectKey: key,
      },
      { status: 201 },
    );
  } catch {
    return Response.json({ ok: false, message: 'Failed to upload image' }, { status: 500 });
  }
}
