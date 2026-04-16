import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 他のパソコンからのアクセスを許可
  allowedDevOrigins: ['10.203.100.63'],
};

export default nextConfig;
