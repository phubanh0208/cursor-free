/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // Optimize for Docker production
  compress: true,
  poweredByHeader: false,
  // Enable SWC minification
  swcMinify: true,
}

module.exports = nextConfig

