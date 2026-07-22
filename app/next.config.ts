import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { config } from "dotenv";

// Nạp biến dùng chung (INTERNAL_API_URL, API_ACCESS_KEY) từ root workspace.
// Chạy sau khi Next đã load .env của app -> không ghi đè biến riêng của app.
config({ path: "../.env.shared", quiet: true });

const withNextIntl = createNextIntlPlugin("./src/i18n.ts");

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-58c2a2ce2005492b99460695ee3e5c25.r2.dev",
        pathname: "/**",
      },
      // Local uploads served by the backend
      {
        protocol: "http",
        hostname: "localhost",
        port: "8080",
        pathname: "/uploads/**",
      },
      // TODO: add your production backend host here, e.g.
      // { protocol: "https", hostname: "api.your-domain.com", pathname: "/uploads/**" },
    ],
  },
};

export default withNextIntl(nextConfig);
