/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@azure/data-tables', '@azure/identity'],
}

module.exports = nextConfig