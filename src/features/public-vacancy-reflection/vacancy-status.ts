import type { Store } from '@/features/top-page/types';

export type PublicVacancyStatus = Store['vacancyStatus'];

export type SeatStatusUpdateRecord = {
  id: string;
  storeId: string;
  status: PublicVacancyStatus;
  expiresAt: number;
  createdAt: number;
};

const compareByLatest = (a: SeatStatusUpdateRecord, b: SeatStatusUpdateRecord): number => {
  if (a.createdAt !== b.createdAt) {
    return b.createdAt - a.createdAt;
  }

  return b.id.localeCompare(a.id);
};

export const resolveVacancyStatus = (
  records: SeatStatusUpdateRecord[],
  nowEpochSeconds: number,
): PublicVacancyStatus => {
  const latestValid = [...records].sort(compareByLatest).find((record) => record.expiresAt > nowEpochSeconds);

  return latestValid?.status ?? 'unavailable';
};

export const createVacancyStatusMap = (
  storeIds: string[],
  records: SeatStatusUpdateRecord[],
  nowEpochSeconds: number,
): Map<string, PublicVacancyStatus> => {
  const grouped = new Map<string, SeatStatusUpdateRecord[]>();

  for (const record of records) {
    const current = grouped.get(record.storeId);
    if (current) {
      current.push(record);
      continue;
    }

    grouped.set(record.storeId, [record]);
  }

  const result = new Map<string, PublicVacancyStatus>();
  for (const storeId of storeIds) {
    result.set(storeId, resolveVacancyStatus(grouped.get(storeId) ?? [], nowEpochSeconds));
  }

  return result;
};

export const applyVacancyStatusToStores = (
  stores: Store[],
  records: SeatStatusUpdateRecord[],
  nowEpochSeconds: number,
): Store[] => {
  const statusMap = createVacancyStatusMap(
    stores.map((store) => store.id),
    records,
    nowEpochSeconds,
  );

  return stores.map((store) => ({
    ...store,
    vacancyStatus: statusMap.get(store.id) ?? 'unavailable',
  }));
};
