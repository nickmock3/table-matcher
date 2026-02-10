import { drizzle } from "drizzle-orm/d1";

import { tryGetCloudflareEnv } from "@/lib/cloudflare";
import { schema } from "@/lib/db/schema";

export const getD1 = async () => {
  const env = await tryGetCloudflareEnv();
  if (env?.DB) return env.DB;
  return null;
};

export const getDrizzleDb = async () => {
  const d1 = await getD1();
  if (!d1) {
    throw new Error("D1 binding(DB) is not available. Use `bun run dev:cf` or set Cloudflare bindings.");
  }
  return drizzle(d1, { schema });
};
