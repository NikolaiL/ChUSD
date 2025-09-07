import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  devIndicators: false,
  // Memory optimization for Vercel builds
  experimental: {
    memoryBasedWorkersCount: true,
    workerThreads: false,
    cpus: 1,
  },
  // Reduce bundle size
  compress: true,
  // Optimize build performance
  typescript: {
    ignoreBuildErrors: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  eslint: {
    ignoreDuringBuilds: process.env.NEXT_PUBLIC_IGNORE_BUILD_ERROR === "true",
  },
  webpack: (config, { isServer }) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    config.externals.push("pino-pretty", "lokijs", "encoding");

    // Memory optimization for Vercel builds
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Create a separate chunk for ethers
            ethers: {
              name: "ethers",
              test: /[\\/]node_modules[\\/]@ethersproject[\\/]/,
              chunks: "all",
              priority: 20,
            },
            // Create a separate chunk for other large libraries
            lib: {
              name: "lib",
              test: /[\\/]node_modules[\\/](wagmi|viem|@rainbow-me)[\\/]/,
              chunks: "all",
              priority: 10,
            },
            // Default chunk for everything else
            default: {
              name: "commons",
              chunks: "all",
              priority: 1,
              minChunks: 2,
            },
          },
        },
      };
    }

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
