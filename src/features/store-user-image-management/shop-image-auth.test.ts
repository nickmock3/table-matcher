import { describe, expect, it } from 'vitest';
import { requireShopImageAccess } from './shop-image-auth';

const withE2EShopImageOverrideEnabled = async (fn: () => Promise<void>) => {
  const previousE2E = process.env.E2E_FORCE_ERROR_ENABLED;
  const previousOverride = process.env.E2E_SHOP_IMAGE_AUTH_OVERRIDE_ENABLED;
  process.env.E2E_FORCE_ERROR_ENABLED = '1';
  process.env.E2E_SHOP_IMAGE_AUTH_OVERRIDE_ENABLED = '1';
  try {
    await fn();
  } finally {
    if (previousE2E === undefined) {
      delete process.env.E2E_FORCE_ERROR_ENABLED;
    } else {
      process.env.E2E_FORCE_ERROR_ENABLED = previousE2E;
    }

    if (previousOverride === undefined) {
      delete process.env.E2E_SHOP_IMAGE_AUTH_OVERRIDE_ENABLED;
    } else {
      process.env.E2E_SHOP_IMAGE_AUTH_OVERRIDE_ENABLED = previousOverride;
    }
  }
};

describe('requireShopImageAccess', () => {
  it('e2e role shop の場合はセッションなしで許可する', async () => {
    await withE2EShopImageOverrideEnabled(async () => {
      const request = new Request('http://localhost/api/shop/images');
      const result = await requireShopImageAccess(request, {
        e2eRoleOverride: 'shop',
        requireSessionFn: async () => ({
          ok: false,
          response: Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 }),
        }),
      });

      expect(result).toEqual({
        ok: true,
        loginEmail: 'shop-sakura@example.com',
      });
    });
  });

  it('e2e role unauthorized の場合は401を返す', async () => {
    await withE2EShopImageOverrideEnabled(async () => {
      const request = new Request('http://localhost/api/shop/images');
      const result = await requireShopImageAccess(request, {
        e2eRoleOverride: 'unauthorized',
        requireSessionFn: async () => ({
          ok: true,
          user: { id: 'x', email: 'shop@example.com' },
        }),
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.response.status).toBe(401);
    });
  });

  it('e2e role forbidden の場合は403を返す', async () => {
    await withE2EShopImageOverrideEnabled(async () => {
      const request = new Request('http://localhost/api/shop/images');
      const result = await requireShopImageAccess(request, {
        e2eRoleOverride: 'forbidden',
        requireSessionFn: async () => ({
          ok: true,
          user: { id: 'x', email: 'shop@example.com' },
        }),
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.response.status).toBe(403);
    });
  });
});

