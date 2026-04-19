/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@azure/data-tables', '@azure/identity'],
  bundlePagesRouterDependencies: false,
  experimental: {
    webpackBuildWorker: false,
  }
}

module.exports = nextConfig