import type { ServerEnv } from '@/lib/env';

type AuthRuntimeEnv = 'local' | 'dev' | 'demo' | 'prod';
type AppEnv = ServerEnv['APP_ENV'];

const hasLocalUrls = (env: ServerEnv): boolean => {
  return Boolean(env.APP_BASE_URL_LOCAL && env.GOOGLE_REDIRECT_URI_LOCAL);
};

const hasDemoUrls = (env: ServerEnv): boolean => {
  return Boolean(env.APP_BASE_URL_DEMO && env.GOOGLE_REDIRECT_URI_DEMO);
};

const resolveRuntimeEnv = (env: ServerEnv, appEnv: AppEnv): AuthRuntimeEnv => {
  if (appEnv === 'prod') {
    return 'prod';
  }
  if (appEnv === 'local') {
    return hasLocalUrls(env) ? 'local' : 'dev';
  }
  if (appEnv === 'demo') {
    return hasDemoUrls(env) ? 'demo' : 'dev';
  }
  if (appEnv === 'e2e') {
    return 'dev';
  }
  return 'dev';
};

export const resolveAuthUrlsFromEnv = (env: ServerEnv, appEnv: AppEnv) => {
  const runtimeEnv = resolveRuntimeEnv(env, appEnv);

  if (runtimeEnv === 'prod') {
    return {
      runtimeEnv,
      baseURL: env.APP_BASE_URL_PROD,
      redirectURI: env.GOOGLE_REDIRECT_URI_PROD,
    };
  }

  if (runtimeEnv === 'local' && env.APP_BASE_URL_LOCAL && env.GOOGLE_REDIRECT_URI_LOCAL) {
    return {
      runtimeEnv,
      baseURL: env.APP_BASE_URL_LOCAL,
      redirectURI: env.GOOGLE_REDIRECT_URI_LOCAL,
    };
  }

  if (runtimeEnv === 'demo' && env.APP_BASE_URL_DEMO && env.GOOGLE_REDIRECT_URI_DEMO) {
    return {
      runtimeEnv,
      baseURL: env.APP_BASE_URL_DEMO,
      redirectURI: env.GOOGLE_REDIRECT_URI_DEMO,
    };
  }

  return {
    runtimeEnv: 'dev' as const,
    baseURL: env.APP_BASE_URL_DEV,
    redirectURI: env.GOOGLE_REDIRECT_URI_DEV,
  };
};
