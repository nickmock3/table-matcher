import { and, eq } from 'drizzle-orm';

import { getD1, getDrizzleDb } from '@/lib/db/client';
import { stores } from '@/lib/db/schema';
import { mapStoreRecordToStore, type StoreRecord } from './store-model';
import type { Store } from '@/features/top-page/types';

export type RepositoryResult<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
    };

const toStoreRecord = (row: {
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
}): StoreRecord => {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    city: row.city,
    genre: row.genre,
    latitude: row.latitude,
    longitude: row.longitude,
    imageUrls: row.imageUrls,
    reservationUrl: row.reservationUrl,
    updatedAt: row.updatedAt,
  };
};

const listStoreRows = async (): Promise<
  RepositoryResult<
    {
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
    }[]
  >
> => {
  const d1 = await getD1();
  if (!d1) {
    return { ok: false };
  }

  try {
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
        updatedAt: stores.updatedAt,
      })
      .from(stores)
      .where(eq(stores.isPublished, true));
    return { ok: true, data: rows };
  } catch {
    return { ok: false };
  }
};

export const listPublishedStores = async (): Promise<RepositoryResult<Store[]>> => {
  const rows = await listStoreRows();
  if (!rows.ok) {
    return { ok: false };
  }

  return {
    ok: true,
    data: rows.data.map((row) => mapStoreRecordToStore(toStoreRecord(row), 'unavailable')),
  };
};

export const findPublishedStoreById = async (storeId: string): Promise<RepositoryResult<Store | null>> => {
  const d1 = await getD1();
  if (!d1) {
    return { ok: false };
  }

  try {
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
        updatedAt: stores.updatedAt,
      })
      .from(stores)
      .where(and(eq(stores.id, storeId), eq(stores.isPublished, true)))
      .limit(1);

    const row = rows[0];
    return {
      ok: true,
      data: row ? mapStoreRecordToStore(toStoreRecord(row), 'unavailable') : null,
    };
  } catch {
    return { ok: false };
  }
};
