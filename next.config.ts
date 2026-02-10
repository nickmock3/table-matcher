import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

void initOpenNextCloudflareForDev();

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  allowedDevOrigins: ["127.0.0.1", "localhost"],
};

export default nextConfig;
