/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        // hostname: 'localhost',  // solo dominio
        hostname: 'https://lm-comments.cartagenacorporation.com',  // solo dominio
        port: '8084',           // puerto separado
        pathname: '/uploads/**' // opcional, patrones de ruta
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',               // sin puerto
        pathname: '/**'
      },
    ],
  },
}

export default nextConfig
