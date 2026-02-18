import type { Store } from '@/features/top-page/types';

export type StoreRecord = {
  id: string;
  name: string;
  address: string | null;
  city: string;
  genre: string;
  latitude: number | null;
  longitude: number | null;
  imageUrls: string | null;
  reservationUrl: string;
  updatedAt: number;
};

export const parseStoreImageUrls = (raw: string | null | undefined): string[] => {
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

export const mapStoreRecordToStore = (
  record: StoreRecord,
  vacancyStatus: Store['vacancyStatus'] = 'unavailable',
): Store => {
  const imageUrls = parseStoreImageUrls(record.imageUrls);

  return {
    id: record.id,
    name: record.name,
    address: record.address ?? undefined,
    city: record.city,
    genre: record.genre,
    reservationUrl: record.reservationUrl,
    vacancyStatus,
    updatedAt: new Date(record.updatedAt * 1000).toISOString(),
    imageUrls: imageUrls.length > 0 ? imageUrls : undefined,
    latitude: record.latitude ?? undefined,
    longitude: record.longitude ?? undefined,
  };
};
