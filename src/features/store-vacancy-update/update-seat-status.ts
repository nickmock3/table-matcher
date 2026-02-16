import { z } from "zod";

export const seatStatusSchema = z.enum(["available", "unavailable"]);

export const seatStatusUpdateRequestSchema = z.object({
  storeId: z.string().min(1),
  status: seatStatusSchema,
});

export type SeatStatus = z.infer<typeof seatStatusSchema>;
export type SeatStatusUpdateRequest = z.infer<typeof seatStatusUpdateRequestSchema>;

export type StoreSeatStatusLink = {
  storeUserId: string;
};

export type CreateSeatStatusUpdateInput = {
  storeId: string;
  status: SeatStatus;
  expiresAt: number;
  updatedByUserId: string;
};

export type SeatStatusUpdateRepository = {
  findLinkedStoreUser(input: { loginEmail: string; storeId: string }): Promise<StoreSeatStatusLink | null>;
  createSeatStatusUpdate(input: CreateSeatStatusUpdateInput): Promise<void>;
};

export type UpdateSeatStatusForStoreUserInput = {
  loginEmail: string;
  storeId: string;
  status: SeatStatus;
};

export type UpdateSeatStatusForStoreUserResult =
  | {
      ok: true;
      expiresAt: number;
    }
  | {
      ok: false;
      code: "forbidden";
    };

export const computeSeatStatusExpiresAt = (nowEpochSeconds: number): number => {
  return nowEpochSeconds + 30 * 60;
};

export const updateSeatStatusForStoreUser = async (
  input: UpdateSeatStatusForStoreUserInput,
  deps: {
    repository: SeatStatusUpdateRepository;
    nowEpochSeconds?: () => number;
  },
): Promise<UpdateSeatStatusForStoreUserResult> => {
  const link = await deps.repository.findLinkedStoreUser({
    loginEmail: input.loginEmail,
    storeId: input.storeId,
  });

  if (!link) {
    return {
      ok: false,
      code: "forbidden",
    };
  }

  const nowEpochSeconds = deps.nowEpochSeconds?.() ?? Math.floor(Date.now() / 1000);
  const expiresAt = computeSeatStatusExpiresAt(nowEpochSeconds);

  await deps.repository.createSeatStatusUpdate({
    storeId: input.storeId,
    status: input.status,
    expiresAt,
    updatedByUserId: link.storeUserId,
  });

  return {
    ok: true,
    expiresAt,
  };
};
