import { inArray } from 'drizzle-orm';

import { getD1, getDrizzleDb } from '@/lib/db/client';
import { seatStatusUpdates } from '@/lib/db/schema';
import type { Store } from '@/features/top-page/types';
import type { RepositoryResult } from '@/features/store-data/store-repository';
import { listPublishedStores } from '@/features/store-data/store-repository';
import { applyVacancyStatusToStores, type SeatStatusUpdateRecord } from './vacancy-status';

type PublicStoreResolverDeps = {
  baseStores?: Store[];
  listBaseStores?: () => Promise<RepositoryResult<Store[]>>;
  nowEpochSeconds?: () => number;
  listSeatStatusUpdates?: (storeIds: string[]) => Promise<SeatStatusUpdateRecord[]>;
};

export type PublicStoresResolution =
  | {
      ok: true;
      stores: Store[];
    }
  | {
      ok: false;
    };

export type PublicStoreByIdResolution =
  | {
      ok: true;
      store: Store;
    }
  | {
      ok: false;
      reason: 'not_found' | 'unavailable';
    };

const defaultNowEpochSeconds = () => Math.floor(Date.now() / 1000);

const listSeatStatusUpdatesFromDb = async (
  storeIds: string[],
): Promise<
  | {
      ok: true;
      updates: SeatStatusUpdateRecord[];
    }
  | {
      ok: false;
    }
> => {
  if (storeIds.length === 0) {
    return { ok: true, updates: [] };
  }

  const d1 = await getD1();
  if (!d1) {
    return { ok: false };
  }

  try {
    const db = await getDrizzleDb();
    const rows = await db
      .select({
        id: seatStatusUpdates.id,
        storeId: seatStatusUpdates.storeId,
        status: seatStatusUpdates.status,
        expiresAt: seatStatusUpdates.expiresAt,
        createdAt: seatStatusUpdates.createdAt,
      })
      .from(seatStatusUpdates)
      .where(inArray(seatStatusUpdates.storeId, storeIds));

    return { ok: true, updates: rows };
  } catch {
    return { ok: false };
  }
};

export const resolvePublicStoresWithVacancyResult = async (
  deps?: PublicStoreResolverDeps,
): Promise<PublicStoresResolution> => {
  const baseStoresResult = deps?.baseStores
    ? { ok: true as const, data: deps.baseStores }
    : deps?.listBaseStores
      ? await deps.listBaseStores()
      : await listPublishedStores();

  if (!baseStoresResult.ok) {
    return { ok: false };
  }

  const baseStores = baseStoresResult.data;
  const storeIds = baseStores.map((store) => store.id);
  const nowEpochSeconds = deps?.nowEpochSeconds?.() ?? defaultNowEpochSeconds();
  const fallbackUnavailable = applyVacancyStatusToStores(baseStores, [], nowEpochSeconds);

  if (deps?.listSeatStatusUpdates) {
    const updates = await deps.listSeatStatusUpdates(storeIds);
    return {
      ok: true,
      stores: applyVacancyStatusToStores(baseStores, updates, nowEpochSeconds),
    };
  }

  const dbResult = await listSeatStatusUpdatesFromDb(storeIds);
  if (!dbResult.ok) {
    return {
      ok: true,
      stores: fallbackUnavailable,
    };
  }

  return {
    ok: true,
    stores: applyVacancyStatusToStores(baseStores, dbResult.updates, nowEpochSeconds),
  };
};

export const resolvePublicStoresWithVacancy = async (deps?: PublicStoreResolverDeps): Promise<Store[]> => {
  const resolved = await resolvePublicStoresWithVacancyResult(deps);
  return resolved.ok ? resolved.stores : [];
};

export const resolvePublicStoreByIdResult = async (
  storeId: string,
  deps?: PublicStoreResolverDeps,
): Promise<PublicStoreByIdResolution> => {
  const storesResult = await resolvePublicStoresWithVacancyResult(deps);
  if (!storesResult.ok) {
    return {
      ok: false,
      reason: 'unavailable',
    };
  }

  const store = storesResult.stores.find((item) => item.id === storeId) ?? null;
  if (!store) {
    return {
      ok: false,
      reason: 'not_found',
    };
  }

  return {
    ok: true,
    store,
  };
};

export const resolvePublicStoreById = async (storeId: string, deps?: PublicStoreResolverDeps): Promise<Store | null> => {
  const result = await resolvePublicStoreByIdResult(storeId, deps);
  return result.ok ? result.store : null;
};
