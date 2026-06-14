import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'http', // Changed from https to http for local development
        hostname: 'localhost' // Your exact local domain
      },
      {
        protocol: 'https',
        hostname: '*.gravatar.com' // Cleaned up wildcard for Gravatar stability
      }
    ]
  }
}

export default nextConfig
