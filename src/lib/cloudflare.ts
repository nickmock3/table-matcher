import { getCloudflareContext } from "@opennextjs/cloudflare";

export const tryGetCloudflareEnv = async () => {
  try {
    const context = await getCloudflareContext({ async: true });
    return context.env;
  } catch {
    return null;
  }
};
