type ShopImageAccessResult =
  | {
      ok: true;
      loginEmail: string;
    }
  | {
      ok: false;
      response: Response;
    };

const isLocalRequestOrigin = (requestUrl: string): boolean => {
  try {
    const parsed = new URL(requestUrl);
    return parsed.hostname === '127.0.0.1' || parsed.hostname === 'localhost';
  } catch {
    return false;
  }
};

const resolveE2EShopRoleOverride = (params: {
  headerValue: string | null;
  requestUrl: string;
}): ShopImageAccessResult | null => {
  if (
    process.env.E2E_FORCE_ERROR_ENABLED !== '1' ||
    process.env.E2E_SHOP_IMAGE_AUTH_OVERRIDE_ENABLED !== '1' ||
    !params.headerValue ||
    !isLocalRequestOrigin(params.requestUrl)
  ) {
    return null;
  }

  if (params.headerValue === 'shop') {
    return {
      ok: true,
      loginEmail: 'shop-sakura@example.com',
    };
  }

  if (params.headerValue === 'forbidden') {
    return {
      ok: false,
      response: Response.json({ ok: false, message: 'Forbidden' }, { status: 403 }),
    };
  }

  if (params.headerValue === 'unauthorized') {
    return {
      ok: false,
      response: Response.json({ ok: false, message: 'Unauthorized' }, { status: 401 }),
    };
  }

  return null;
};

export const requireShopImageAccess = async (
  request: Request,
  dependencies: {
    requireSessionFn: (request: Request) => Promise<
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
        }
    >;
    e2eRoleOverride?: string | null;
  },
): Promise<ShopImageAccessResult> => {
  const override = resolveE2EShopRoleOverride({
    headerValue: dependencies.e2eRoleOverride ?? request.headers.get('x-e2e-shop-role'),
    requestUrl: request.url,
  });
  if (override) {
    return override;
  }

  const sessionResult = await dependencies.requireSessionFn(request);
  if (!sessionResult.ok) {
    return sessionResult;
  }

  return {
    ok: true,
    loginEmail: sessionResult.user.email,
  };
};
