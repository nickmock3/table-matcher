import { describe, expect, it } from 'vitest';
import { createAuthzErrorResponse, requireRole, requireSession, requireStoreScope } from './guards';

describe('createAuthzErrorResponse', () => {
  it('ok=falseとmessageを含むエラーレスポンスを返す', async () => {
    const response = createAuthzErrorResponse(401, 'Unauthorized');
    const payload = (await response.json()) as { ok: boolean; message: string };

    expect(response.status).toBe(401);
    expect(payload).toEqual({
      ok: false,
      message: 'Unauthorized',
    });
  });
});

describe('requireSession', () => {
  it('セッションがない場合は401を返す', async () => {
    const request = new Request('http://localhost/api/protected');

    const result = await requireSession(request, {
      getSession: async () => null,
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

  it('セッションにemailがない場合は401を返す', async () => {
    const request = new Request('http://localhost/api/protected');

    const result = await requireSession(request, {
      getSession: async () => ({ user: { id: 'user-1', email: null } }),
    });

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.response.status).toBe(401);
  });

  it('セッションがある場合はユーザー情報を返す', async () => {
    const request = new Request('http://localhost/api/protected');

    const result = await requireSession(request, {
      getSession: async () => ({
        user: {
          id: 'user-1',
          email: 'shop-sakura@example.com',
        },
      }),
    });

    expect(result).toEqual({
      ok: true,
      user: {
        id: 'user-1',
        email: 'shop-sakura@example.com',
      },
    });
  });
});

describe('requireRole', () => {
  it('ロールが未設定の場合は403を返す', async () => {
    const result = requireRole(null, ['admin']);

    expect(result.ok).toBe(false);
    if (result.ok) return;

    const payload = (await result.response.json()) as { ok: boolean; message: string };
    expect(result.response.status).toBe(403);
    expect(payload).toEqual({
      ok: false,
      message: 'Forbidden',
    });
  });

  it('ロールが許可対象外の場合は403を返す', () => {
    const result = requireRole('shop', ['admin']);
    expect(result).toMatchObject({ ok: false });
  });

  it('ロールが許可対象の場合は成功する', () => {
    const result = requireRole('admin', ['admin', 'shop']);
    expect(result).toEqual({ ok: true });
  });
});

describe('requireStoreScope', () => {
  it('紐づけがない場合は403を返す', async () => {
    const result = await requireStoreScope(
      { loginEmail: 'none@example.com' },
      { listStoreLinks: async () => [] },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;

    const payload = (await result.response.json()) as { ok: boolean; message: string };
    expect(result.response.status).toBe(403);
    expect(payload).toEqual({
      ok: false,
      message: 'Forbidden',
    });
  });

  it('指定店舗が自店舗と一致する場合は許可される', async () => {
    const result = await requireStoreScope(
      { loginEmail: 'shop@example.com', requestedStoreId: '3' },
      {
        listStoreLinks: async () => [
          { storeId: '3', storeName: '和食処 さくら' },
          { storeId: '4', storeName: 'フレンチビストロ パリ' },
        ],
      },
    );

    expect(result).toEqual({
      ok: true,
      link: { storeId: '3', storeName: '和食処 さくら' },
    });
  });

  it('指定店舗が他店舗の場合は403を返す', async () => {
    const result = await requireStoreScope(
      { loginEmail: 'shop@example.com', requestedStoreId: '9' },
      {
        listStoreLinks: async () => [{ storeId: '3', storeName: '和食処 さくら' }],
      },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;

    expect(result.response.status).toBe(403);
  });

  it('店舗未指定で複数紐づけの場合は409を返す', async () => {
    const result = await requireStoreScope(
      { loginEmail: 'shop@example.com' },
      {
        listStoreLinks: async () => [{ storeId: '3' }, { storeId: '4' }],
      },
    );

    expect(result.ok).toBe(false);
    if (result.ok) return;

    const payload = (await result.response.json()) as { ok: boolean; message: string };
    expect(result.response.status).toBe(409);
    expect(payload).toEqual({
      ok: false,
      message: 'Multiple linked stores found',
    });
  });
});
