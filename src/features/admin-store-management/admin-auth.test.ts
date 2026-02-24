import { describe, expect, it } from 'vitest';
import { requireAdminAccess } from './admin-auth';

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
});
