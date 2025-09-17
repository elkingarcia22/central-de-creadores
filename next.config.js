import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };
    
    // Configurar path mappings para paquetes
    config.resolve.alias = {
      ...config.resolve.alias,
      '@packages/ai-router': path.resolve(__dirname, 'packages/ai-router/src'),
      '@packages/prompt-kit': path.resolve(__dirname, 'packages/prompt-kit/src'),
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
