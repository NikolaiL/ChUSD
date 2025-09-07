import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: config => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Fix for @ethersproject module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      "@ethersproject/strings": require.resolve("@ethersproject/strings"),
      "@ethersproject/strings/lib/utf8": require.resolve("@ethersproject/strings/lib/utf8.js"),
      "@ethersproject/bytes": require.resolve("@ethersproject/bytes"),
      "@ethersproject/keccak256": require.resolve("@ethersproject/keccak256"),
      "@ethersproject/sha2": require.resolve("@ethersproject/sha2"),
    };

    // Additional module resolution for RedStone SDK
    config.resolve.modules = ["node_modules"];
    config.resolve.extensionAlias = {
      ".js": [".js", ".ts", ".tsx"],
    };

    return config;
  },
};

const isIpfs = process.env.NEXT_PUBLIC_IPFS_BUILD === "true";

if (isIpfs) {
  nextConfig.output = "export";
  nextConfig.trailingSlash = true;
  nextConfig.images = {
    unoptimized: true,
  };
}

module.exports = nextConfig;
