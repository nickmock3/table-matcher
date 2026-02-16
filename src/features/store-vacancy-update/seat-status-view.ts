export type CurrentStatus = 'available' | 'unavailable' | 'unknown';

export type SeatStatusState = {
  storeId: string;
  storeName: string | null;
  coverImageUrl: string | null;
  currentStatus: CurrentStatus;
  expiresAt: number | null;
  canMarkAvailable: boolean;
};

export type LatestSeatStatus = {
  status: 'available' | 'unavailable';
  expiresAt: number;
};

export const resolveCurrentSeatStatus = (
  latest: LatestSeatStatus | null,
  nowEpoch: number,
): Pick<SeatStatusState, 'currentStatus' | 'expiresAt' | 'canMarkAvailable'> => {
  if (!latest || latest.expiresAt <= nowEpoch) {
    return {
      currentStatus: 'unknown',
      expiresAt: null,
      canMarkAvailable: true,
    };
  }

  if (latest.status === 'available') {
    return {
      currentStatus: 'available',
      expiresAt: latest.expiresAt,
      canMarkAvailable: false,
    };
  }

  return {
    currentStatus: 'unavailable',
    expiresAt: latest.expiresAt,
    canMarkAvailable: true,
  };
};

export const parseSeatStatusState = (payload: unknown): SeatStatusState | null => {
  if (typeof payload !== 'object' || payload === null) {
    return null;
  }

  const data = payload as {
    ok?: unknown;
    storeId?: unknown;
    storeName?: unknown;
    coverImageUrl?: unknown;
    currentStatus?: unknown;
    expiresAt?: unknown;
    canMarkAvailable?: unknown;
  };

  if (data.ok !== true) return null;
  if (typeof data.storeId !== 'string') return null;
  if (
    data.currentStatus !== 'available' &&
    data.currentStatus !== 'unavailable' &&
    data.currentStatus !== 'unknown'
  ) {
    return null;
  }
  if (data.expiresAt !== null && typeof data.expiresAt !== 'number') return null;
  if (typeof data.canMarkAvailable !== 'boolean') return null;
  if (data.storeName !== null && data.storeName !== undefined && typeof data.storeName !== 'string') {
    return null;
  }
  if (
    data.coverImageUrl !== null &&
    data.coverImageUrl !== undefined &&
    typeof data.coverImageUrl !== 'string'
  ) {
    return null;
  }

  return {
    storeId: data.storeId,
    storeName: data.storeName ?? null,
    coverImageUrl: data.coverImageUrl ?? null,
    currentStatus: data.currentStatus,
    expiresAt: data.expiresAt,
    canMarkAvailable: data.canMarkAvailable,
  };
};

export const isMarkAvailableActionDisabled = (params: {
  isLoading: boolean;
  isSubmitting: boolean;
  state: SeatStatusState | null;
}): boolean => {
  return params.isLoading || params.isSubmitting || !params.state?.canMarkAvailable;
};
