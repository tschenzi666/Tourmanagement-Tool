import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["@prisma/client", "bcryptjs"],
  allowedDevOrigins: ["http://178.104.13.120:3000"],
};

export default nextConfig;
