import { tryGetCloudflareEnv } from '@/lib/cloudflare';

type StoreImageRouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const decodePath = (segments: readonly string[]): string => {
  return segments.map((segment) => decodeURIComponent(segment)).join('/');
};

export async function GET(_request: Request, context: StoreImageRouteContext) {
  try {
    const { path } = await context.params;
    if (!path || path.length === 0) {
      return Response.json({ ok: false, message: 'Not found' }, { status: 404 });
    }

    const key = decodePath(path);
    const cfEnv = await tryGetCloudflareEnv();
    const bucket = cfEnv?.BUCKET_IMAGES;
    if (!bucket) {
      return Response.json({ ok: false, message: 'Image bucket is not available' }, { status: 500 });
    }

    const object = await bucket.get(key);
    if (!object || !object.body) {
      return Response.json({ ok: false, message: 'Not found' }, { status: 404 });
    }

    const contentType =
      (object.httpMetadata as { contentType?: string } | undefined)?.contentType ?? 'application/octet-stream';

    return new Response(object.body, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return Response.json({ ok: false, message: 'Failed to fetch image' }, { status: 500 });
  }
}

