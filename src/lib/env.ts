import { z } from "zod";

const serverEnvSchema = z.object({
  BETTER_AUTH_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI_DEV: z.string().url(),
  GOOGLE_REDIRECT_URI_PROD: z.string().url(),
  APP_BASE_URL_DEV: z.string().url(),
  APP_BASE_URL_PROD: z.string().url(),
  APP_ENV: z.enum(["dev", "prod"]).default("dev"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const getRawServerEnv = () => ({
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI_DEV: process.env.GOOGLE_REDIRECT_URI_DEV,
  GOOGLE_REDIRECT_URI_PROD: process.env.GOOGLE_REDIRECT_URI_PROD,
  APP_BASE_URL_DEV: process.env.APP_BASE_URL_DEV,
  APP_BASE_URL_PROD: process.env.APP_BASE_URL_PROD,
  APP_ENV: process.env.APP_ENV,
});

export const readServerEnv = () => {
  return serverEnvSchema.parse(getRawServerEnv());
};
