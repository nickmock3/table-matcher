import { describe, expect, it } from 'vitest';
import type { ServerEnv } from '@/lib/env';
import { resolveAuthUrlsFromEnv } from './url-resolver';

const baseEnv: ServerEnv = {
  BETTER_AUTH_SECRET: 'x'.repeat(32),
  GOOGLE_CLIENT_ID: 'client-id',
  GOOGLE_CLIENT_SECRET: 'client-secret',
  GOOGLE_REDIRECT_URI_DEV: 'https://dev.example.com/api/auth/callback/google',
  GOOGLE_REDIRECT_URI_PROD: 'https://prod.example.com/api/auth/callback/google',
  APP_BASE_URL_DEV: 'https://dev.example.com',
  APP_BASE_URL_PROD: 'https://prod.example.com',
  APP_ENV: 'dev',
};

describe('resolveAuthUrlsFromEnv', () => {
  it('prod環境ではprodのURLを返す', () => {
    const result = resolveAuthUrlsFromEnv(baseEnv, 'prod');
    expect(result).toEqual({
      runtimeEnv: 'prod',
      baseURL: 'https://prod.example.com',
      redirectURI: 'https://prod.example.com/api/auth/callback/google',
    });
  });

  it('local設定がある場合はlocalのURLを返す', () => {
    const result = resolveAuthUrlsFromEnv(
      {
        ...baseEnv,
        APP_BASE_URL_LOCAL: 'http://127.0.0.1:8787',
        GOOGLE_REDIRECT_URI_LOCAL: 'http://127.0.0.1:8787/api/auth/callback/google',
      },
      'local',
    );

    expect(result).toEqual({
      runtimeEnv: 'local',
      baseURL: 'http://127.0.0.1:8787',
      redirectURI: 'http://127.0.0.1:8787/api/auth/callback/google',
    });
  });

  it('local設定がない場合はdevへフォールバックする', () => {
    const result = resolveAuthUrlsFromEnv(baseEnv, 'local');
    expect(result).toEqual({
      runtimeEnv: 'dev',
      baseURL: 'https://dev.example.com',
      redirectURI: 'https://dev.example.com/api/auth/callback/google',
    });
  });

  it('demo設定がある場合はdemoのURLを返す', () => {
    const result = resolveAuthUrlsFromEnv(
      {
        ...baseEnv,
        APP_BASE_URL_DEMO: 'https://demo.example.com',
        GOOGLE_REDIRECT_URI_DEMO: 'https://demo.example.com/api/auth/callback/google',
      },
      'demo',
    );

    expect(result).toEqual({
      runtimeEnv: 'demo',
      baseURL: 'https://demo.example.com',
      redirectURI: 'https://demo.example.com/api/auth/callback/google',
    });
  });

  it('e2e環境はdevを利用する', () => {
    const result = resolveAuthUrlsFromEnv(baseEnv, 'e2e');
    expect(result).toEqual({
      runtimeEnv: 'dev',
      baseURL: 'https://dev.example.com',
      redirectURI: 'https://dev.example.com/api/auth/callback/google',
    });
  });
});
