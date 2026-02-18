import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { tryGetCloudflareEnv } from "@/lib/cloudflare";
import { getDrizzleDb } from "@/lib/db/client";
import { schema } from "@/lib/db/schema";
import { resolveAuthUrlsFromEnv } from "@/lib/auth/url-resolver";
import { readServerEnv } from "@/lib/env";

const getAuthUrls = async () => {
  const env = readServerEnv();
  const cfEnv = await tryGetCloudflareEnv();
  const appEnv = cfEnv?.APP_ENV ?? env.APP_ENV;

  const { baseURL, redirectURI } = resolveAuthUrlsFromEnv(env, appEnv);

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
