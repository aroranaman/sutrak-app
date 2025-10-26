
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ["@react-three/fiber", "@react-three/drei", "three"],
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
    const topScheduler    = require.resolve("scheduler");

    config.resolve.alias = {
      ...(config.resolve.alias || {}),

      // Force all imports to the top-level copies
      react: topReact,
      "react-dom": topReactDOM,
      scheduler: topScheduler,

      // Also collapse any nested copies inside R3F (what your stack shows)
      "@react-three/fiber/node_modules/react": topReact,
      "@react-three/fiber/node_modules/react-dom": topReactDOM,
      "@react-three/fiber/node_modules/scheduler": topScheduler,
      "@react-three/drei/node_modules/react": topReact,
      "@react-three/drei/node_modules/react-dom": topReactDOM,
      "@react-three/drei/node_modules/scheduler": topScheduler,
    };

    try {
      const topReconciler = require.resolve("react-reconciler");
      config.resolve.alias["react-reconciler"] = topReconciler;
      config.resolve.alias["@react-three/fiber/node_modules/react-reconciler"] = topReconciler;
      config.resolve.alias["@react-three/drei/node_modules/react-reconciler"] = topReconciler;
    } catch (e) {
      // react-reconciler may not be a direct dependency
      console.log('Could not create alias for react-reconciler', e);
    }


    return config;
  },
};

export default nextConfig;
