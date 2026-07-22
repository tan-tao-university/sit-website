import type { NextConfig } from "next";
import { config } from "dotenv";

// Nạp biến dùng chung (INTERNAL_API_URL, API_ACCESS_KEY) từ root workspace.
config({ path: "../.env.shared", quiet: true });

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
};

export default nextConfig;
