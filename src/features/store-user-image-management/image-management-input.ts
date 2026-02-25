import { z } from 'zod';

const imageUrlSchema = z.string().url().refine((value) => {
  try {
    const parsed = new URL(value);
    if (parsed.protocol === 'https:') {
      return true;
    }

    // Local development exception.
    const isLocalhost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
    return isLocalhost && parsed.protocol === 'http:';
  } catch {
    return false;
  }
}, 'image URL must use https (localhost/127.0.0.1 only supports http for dev)');

export const storeImageUrlsSchema = z
  .array(imageUrlSchema)
  .min(1, 'at least 1 image is required')
  .max(10, 'up to 10 images are allowed')
  .superRefine((value, ctx) => {
    const seen = new Set<string>();
    for (const [index, imageUrl] of value.entries()) {
      if (seen.has(imageUrl)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: [index],
          message: 'duplicate image URL is not allowed',
        });
      }
      seen.add(imageUrl);
    }
  });

export const shopStoreImageUpdateSchema = z.object({
  storeId: z.string().min(1).optional(),
  imageUrls: storeImageUrlsSchema,
});

export type ShopStoreImageUpdateInput = z.infer<typeof shopStoreImageUpdateSchema>;

export const parseImageUrls = (raw: string | null | undefined): string[] => {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item): item is string => typeof item === 'string' && item.length > 0);
  } catch {
    return [];
  }
};

export const serializeImageUrls = (imageUrls: readonly string[]): string => {
  return JSON.stringify(imageUrls);
};

export const listRemovedImageUrls = (
  previousImageUrls: readonly string[],
  nextImageUrls: readonly string[],
): string[] => {
  const next = new Set(nextImageUrls);
  return previousImageUrls.filter((imageUrl) => !next.has(imageUrl));
};
