import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { tryGetCloudflareEnv } from "@/lib/cloudflare";
import { getDrizzleDb } from "@/lib/db/client";
import { schema } from "@/lib/db/schema";
import { readServerEnv } from "@/lib/env";

const getAuthUrls = async () => {
  const env = readServerEnv();
  const cfEnv = await tryGetCloudflareEnv();
  const appEnv = cfEnv?.APP_ENV ?? env.APP_ENV;

  const baseURL = appEnv === "prod" ? env.APP_BASE_URL_PROD : env.APP_BASE_URL_DEV;
  const redirectURI =
    appEnv === "prod" ? env.GOOGLE_REDIRECT_URI_PROD : env.GOOGLE_REDIRECT_URI_DEV;

  return { baseURL, redirectURI, env };
};

export const createAuth = async () => {
  const db = await getDrizzleDb();
  const { baseURL, redirectURI, env } = await getAuthUrls();

  return betterAuth({
    baseURL,
    basePath: "/api/auth",
    secret: env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema,
    }),
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        redirectURI,
      },
    },
  });
};
