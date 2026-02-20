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

type StoreScopedLink = {
  storeId: string;
};

type ListStoreLinks<TLink extends StoreScopedLink> = (loginEmail: string) => Promise<readonly TLink[]>;

type RequireStoreScopeDependencies<TLink extends StoreScopedLink> = {
  listStoreLinks: ListStoreLinks<TLink>;
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

export type StoreScopeGuardResult<TLink extends StoreScopedLink> =
  | {
      ok: true;
      link: TLink;
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

export const requireStoreScope = async <TLink extends StoreScopedLink>(
  params: {
    loginEmail: string;
    requestedStoreId?: string;
  },
  dependencies: RequireStoreScopeDependencies<TLink>,
): Promise<StoreScopeGuardResult<TLink>> => {
  const links = await dependencies.listStoreLinks(params.loginEmail);

  if (links.length === 0) {
    return {
      ok: false,
      response: createAuthzErrorResponse(403, 'Forbidden'),
    };
  }

  if (params.requestedStoreId) {
    const matched = links.find((link) => link.storeId === params.requestedStoreId);
    if (!matched) {
      return {
        ok: false,
        response: createAuthzErrorResponse(403, 'Forbidden'),
      };
    }

    return {
      ok: true,
      link: matched,
    };
  }

  if (links.length > 1) {
    return {
      ok: false,
      response: Response.json({ ok: false, message: 'Multiple linked stores found' }, { status: 409 }),
    };
  }

  return {
    ok: true,
    link: links[0],
  };
};
