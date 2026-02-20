import { createAuth } from '@/lib/auth/server';

type SessionUser = {
  id?: string | null;
  email?: string | null;
};

type SessionPayload = {
  user?: SessionUser | null;
} | null;

type GetSession = (request: Request) => Promise<SessionPayload>;

type RequireSessionDependencies = {
  getSession?: GetSession;
};

export type SessionGuardResult =
  | {
      ok: true;
      user: {
        id: string | null;
        email: string;
      };
    }
  | {
      ok: false;
      response: Response;
    };

export type RoleGuardResult =
  | {
      ok: true;
    }
  | {
      ok: false;
      response: Response;
    };

const defaultGetSession: GetSession = async (request) => {
  const auth = await createAuth();
  return auth.api.getSession({
    headers: request.headers,
  });
};

export const createAuthzErrorResponse = (status: 401 | 403, message: string): Response => {
  return Response.json({ ok: false, message }, { status });
};

export const requireSession = async (
  request: Request,
  dependencies?: RequireSessionDependencies,
): Promise<SessionGuardResult> => {
  const getSession = dependencies?.getSession ?? defaultGetSession;
  const session = await getSession(request);
  const email = session?.user?.email;

  if (!email) {
    return {
      ok: false,
      response: createAuthzErrorResponse(401, 'Unauthorized'),
    };
  }

  return {
    ok: true,
    user: {
      id: session?.user?.id ?? null,
      email,
    },
  };
};

export const requireRole = (
  role: string | null | undefined,
  allowedRoles: readonly string[],
): RoleGuardResult => {
  if (!role || !allowedRoles.includes(role)) {
    return {
      ok: false,
      response: createAuthzErrorResponse(403, 'Forbidden'),
    };
  }

  return { ok: true };
};
