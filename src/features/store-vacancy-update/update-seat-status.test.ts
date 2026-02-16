import { describe, expect, it, vi } from "vitest";

import {
  seatStatusUpdateRequestSchema,
  updateSeatStatusForStoreUser,
  computeSeatStatusExpiresAt,
  type SeatStatusUpdateRepository,
} from "./update-seat-status";

describe("seatStatusUpdateRequestSchema", () => {
  it("不正なstatusを拒否する", () => {
    const parsed = seatStatusUpdateRequestSchema.safeParse({
      storeId: "store-1",
      status: "busy",
    });

    expect(parsed.success).toBe(false);
  });
});

describe("computeSeatStatusExpiresAt", () => {
  it("30分を加算する", () => {
    expect(computeSeatStatusExpiresAt(1000)).toBe(2800);
  });
});

describe("updateSeatStatusForStoreUser", () => {
  it("店舗紐付けがない場合はforbiddenを返す", async () => {
    const repository: SeatStatusUpdateRepository = {
      findLinkedStoreUser: vi.fn(async () => null),
      createSeatStatusUpdate: vi.fn(async () => undefined),
    };

    const result = await updateSeatStatusForStoreUser(
      {
        loginEmail: "shop@example.com",
        storeId: "store-1",
        status: "available",
      },
      { repository },
    );

    expect(result).toEqual({
      ok: false,
      code: "forbidden",
    });
    expect(repository.createSeatStatusUpdate).not.toHaveBeenCalled();
  });

  it("認可済みの場合は計算したexpiresAtで保存する", async () => {
    const repository: SeatStatusUpdateRepository = {
      findLinkedStoreUser: vi.fn(async () => ({ storeUserId: "user-1" })),
      createSeatStatusUpdate: vi.fn(async () => undefined),
    };

    const result = await updateSeatStatusForStoreUser(
      {
        loginEmail: "shop@example.com",
        storeId: "store-1",
        status: "unavailable",
      },
      {
        repository,
        nowEpochSeconds: () => 2000,
      },
    );

    expect(result).toEqual({
      ok: true,
      expiresAt: 3800,
    });

    expect(repository.createSeatStatusUpdate).toHaveBeenCalledWith({
      storeId: "store-1",
      status: "unavailable",
      expiresAt: 3800,
      updatedByUserId: "user-1",
    });
  });
});
