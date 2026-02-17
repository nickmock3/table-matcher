import { inArray } from 'drizzle-orm';

import { getD1, getDrizzleDb } from '@/lib/db/client';
import { seatStatusUpdates } from '@/lib/db/schema';
import { mockStoreRepository } from '@/features/top-page/data/storeRepository';
import type { Store } from '@/features/top-page/types';
import { applyVacancyStatusToStores, type SeatStatusUpdateRecord } from './vacancy-status';

type PublicStoreResolverDeps = {
  baseStores?: Store[];
  nowEpochSeconds?: () => number;
  listSeatStatusUpdates?: (storeIds: string[]) => Promise<SeatStatusUpdateRecord[]>;
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

export const resolvePublicStoresWithVacancy = async (deps?: PublicStoreResolverDeps): Promise<Store[]> => {
  const baseStores = deps?.baseStores ?? mockStoreRepository.listStores();
  const storeIds = baseStores.map((store) => store.id);
  const nowEpochSeconds = deps?.nowEpochSeconds?.() ?? defaultNowEpochSeconds();
  const fallbackUnavailable = applyVacancyStatusToStores(baseStores, [], nowEpochSeconds);

  if (deps?.listSeatStatusUpdates) {
    const updates = await deps.listSeatStatusUpdates(storeIds);
    return applyVacancyStatusToStores(baseStores, updates, nowEpochSeconds);
  }

  const dbResult = await listSeatStatusUpdatesFromDb(storeIds);
  if (!dbResult.ok) {
    return fallbackUnavailable;
  }

  return applyVacancyStatusToStores(baseStores, dbResult.updates, nowEpochSeconds);
};

export const resolvePublicStoreById = async (
  storeId: string,
  deps?: PublicStoreResolverDeps,
): Promise<Store | null> => {
  const stores = await resolvePublicStoresWithVacancy(deps);
  return stores.find((store) => store.id === storeId) ?? null;
};
