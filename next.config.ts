import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/login",
        permanent: true,
      }
    ]
  },
  images: {
    remotePatterns: [
      {
        // Google Profile Images
        hostname: 'lh3.googleusercontent.com',
        protocol: 'https',
        pathname: '/**',
        port: ''
      },
      {
        // Comment Service Images - Local
        pathname: '/uploads/**',
        hostname: 'localhost',
        protocol: 'http',
        port: '8084'
      },
      {
        // Comment Service Images - Production
        hostname: 'https://lm-comments.cartagenacorporation.com',
        pathname: '/uploads/**',
        protocol: 'https',
        port: '8084'
      },
    ]
  }
}

export default nextConfig
