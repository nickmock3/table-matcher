import { describe, expect, it } from 'vitest';
import { requireAdminAccess } from './admin-auth';

const withE2EForceErrorEnabled = async (fn: () => Promise<void>) => {
  const previous = process.env.E2E_FORCE_ERROR_ENABLED;
  const previousAdminOverride = process.env.E2E_ADMIN_AUTH_OVERRIDE_ENABLED;
  process.env.E2E_FORCE_ERROR_ENABLED = '1';
  process.env.E2E_ADMIN_AUTH_OVERRIDE_ENABLED = '1';
  try {
    await fn();
  } finally {
    if (previous === undefined) {
      delete process.env.E2E_FORCE_ERROR_ENABLED;
    } else {
      process.env.E2E_FORCE_ERROR_ENABLED = previous;
    }

    if (previousAdminOverride === undefined) {
      delete process.env.E2E_ADMIN_AUTH_OVERRIDE_ENABLED;
    } else {
      process.env.E2E_ADMIN_AUTH_OVERRIDE_ENABLED = previousAdminOverride;
    }
  }
};

describe('requireAdminAccess', () => {
  it('未ログイン時は401を返す', async () => {
    const request = new Request('http://localhost/api/admin/stores');
    const result = await requireAdminAccess(request, {
      requireSessionFn: async () => ({
        ok: false,
        response: Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 }),
      }),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    const payload = (await result.response.json()) as { ok: boolean; message: string };
    expect(result.response.status).toBe(401);
    expect(payload).toEqual({
      ok: false,
      message: 'Unauthorized',
    });
  });

  it('非管理者ロール時は403を返す', async () => {
    const request = new Request('http://localhost/api/admin/stores');
    const result = await requireAdminAccess(request, {
      requireSessionFn: async () => ({
        ok: true,
        user: {
          id: 'user-1',
          email: 'shop-sakura@example.com',
        },
      }),
      resolveRoleByEmail: async () => 'shop',
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    const payload = (await result.response.json()) as { ok: boolean; message: string };
    expect(result.response.status).toBe(403);
    expect(payload).toEqual({
      ok: false,
      message: 'Forbidden',
    });
  });

  it('管理者ロール時はアクセス許可する', async () => {
    const request = new Request('http://localhost/api/admin/stores');
    const result = await requireAdminAccess(request, {
      requireSessionFn: async () => ({
        ok: true,
        user: {
          id: 'user-admin',
          email: 'admin@example.com',
        },
      }),
      resolveRoleByEmail: async () => 'admin',
    });

    expect(result).toEqual({
      ok: true,
      email: 'admin@example.com',
    });
  });

  it('e2eヘッダーがadminの場合はセッションなしでも許可する', async () => {
    await withE2EForceErrorEnabled(async () => {
      const request = new Request('http://localhost/api/admin/stores');
      const result = await requireAdminAccess(request, {
        e2eAdminRoleOverride: 'admin',
      });

      expect(result).toEqual({
        ok: true,
        email: 'e2e-admin@example.com',
      });
    });
  });

  it('e2eヘッダーがshopの場合は403を返す', async () => {
    await withE2EForceErrorEnabled(async () => {
      const request = new Request('http://localhost/api/admin/stores');
      const result = await requireAdminAccess(request, {
        e2eAdminRoleOverride: 'shop',
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.response.status).toBe(403);
    });
  });

  it('e2eヘッダーがunauthorizedの場合は401を返す', async () => {
    await withE2EForceErrorEnabled(async () => {
      const request = new Request('http://localhost/api/admin/stores');
      const result = await requireAdminAccess(request, {
        e2eAdminRoleOverride: 'unauthorized',
      });

      expect(result.ok).toBe(false);
      if (result.ok) return;

      expect(result.response.status).toBe(401);
    });
  });
});
