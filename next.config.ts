
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  experimental: {
    transpilePackages: ["@react-three/fiber", "@react-three/drei", "three"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  devIndicators: {
    position: 'bottom-right',
  },
  allowedDevOrigins: ['**/*.cloudworkstations.dev'],
  webpack: (config) => {
    // Resolve to the single, top-level installs
    const topReact        = require.resolve("react");
    const topReactDOM     = require.resolve("react-dom");
    const topReconciler   = require.resolve("react-reconciler");
    const topScheduler    = require.resolve("scheduler");

    config.resolve.alias = {
      ...(config.resolve.alias || {}),

      // Force all imports to the top-level copies
      react: topReact,
      "react-dom": topReactDOM,
      "react-reconciler": topReconciler,
      scheduler: topScheduler,

      // Also collapse any nested copies inside R3F (what your stack shows)
      "@react-three/fiber/node_modules/react": topReact,
      "@react-three/fiber/node_modules/react-dom": topReactDOM,
      "@react-three/fiber/node_modules/react-reconciler": topReconciler,
      "@react-three/fiber/node_modules/scheduler": topScheduler,
      "@react-three/drei/node_modules/react": topReact,
      "@react-three/drei/node_modules/react-dom": topReactDOM,
      "@react-three/drei/node_modules/react-reconciler": topReconciler,
      "@react-three/drei/node_modules/scheduler": topScheduler,
    };

    return config;
  },
};

export default nextConfig;
