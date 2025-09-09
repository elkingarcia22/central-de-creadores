/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Configuración para Vercel (SSR habilitado)
  // output: 'export', // Comentado para Vercel
  // trailingSlash: true, // Comentado para Vercel
  images: {
    domains: ['localhost']
  }
}

export default nextConfig
