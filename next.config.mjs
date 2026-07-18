/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',  // solo dominio
        // hostname: 'https://lm-comments.cartagenacorporation.com',  // solo dominio
        port: '8084',           // puerto separado
        pathname: '/uploads/**' // opcional, patrones de ruta
      },
      {
        protocol: 'https',
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
  webpack: (config) => {
    // 'supports-color' es una dependencia opcional de 'debug' (via sockjs-client)
    // que solo se usa en Node. En el bundle del navegador no hace falta, así que
    // la resolvemos a un módulo vacío para evitar el warning "Module not found".
    config.resolve.fallback = {
      ...config.resolve.fallback,
      'supports-color': false,
    }
    return config
  },
}

export default nextConfig
