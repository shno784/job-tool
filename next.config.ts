// next.config.js
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      const externals = Array.isArray(config.externals)
        ? config.externals
        : [config.externals];

      config.externals = [
        ...externals,
        // regex to exclude these modules from bundling
        /^chrome-aws-lambda($|\/)/,
        /^puppeteer-core($|\/)/,
      ];
    }
    return config;
  },
};

export default nextConfig;
