/** @type {import('next').NextConfig} */
const nextConfig = {
  swcMinify: false,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Disable SWC
      '@next/swc-linux-x64-gnu': false,
      '@next/swc-linux-x64-musl': false,
    };
    return config;
  },
}

module.exports = nextConfig