import { z } from 'zod';

const latitudeSchema = z.number().min(-90).max(90);
const longitudeSchema = z.number().min(-180).max(180);

const imageUrlsSchema = z.array(z.string().url()).max(10);

const coordinatesPairRefinement = <T extends { latitude?: number | null; longitude?: number | null }>(
  value: T,
): boolean => {
  const hasLatitude = value.latitude !== null && value.latitude !== undefined;
  const hasLongitude = value.longitude !== null && value.longitude !== undefined;
  return hasLatitude === hasLongitude;
};

export const adminStoreCreateSchema = z
  .object({
    name: z.string().min(1),
    address: z.string().trim().min(1).nullable().optional(),
    city: z.string().min(1),
    genre: z.string().min(1),
    latitude: latitudeSchema.nullable().optional(),
    longitude: longitudeSchema.nullable().optional(),
    imageUrls: imageUrlsSchema.optional(),
    reservationUrl: z.string().url(),
    isPublished: z.boolean().optional(),
  })
  .refine(coordinatesPairRefinement, {
    message: 'latitude and longitude must be provided together',
    path: ['latitude'],
  });

export const adminStoreUpdateSchema = z
  .object({
    name: z.string().min(1).optional(),
    address: z.string().trim().min(1).nullable().optional(),
    city: z.string().min(1).optional(),
    genre: z.string().min(1).optional(),
    latitude: latitudeSchema.nullable().optional(),
    longitude: longitudeSchema.nullable().optional(),
    imageUrls: imageUrlsSchema.optional(),
    reservationUrl: z.string().url().optional(),
    isPublished: z.boolean().optional(),
  })
  .refine(coordinatesPairRefinement, {
    message: 'latitude and longitude must be provided together',
    path: ['latitude'],
  });

export type AdminStoreCreateInput = z.infer<typeof adminStoreCreateSchema>;
export type AdminStoreUpdateInput = z.infer<typeof adminStoreUpdateSchema>;

export const serializeImageUrls = (imageUrls: readonly string[] | undefined): string | null => {
  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  return JSON.stringify(imageUrls);
};
