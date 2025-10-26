
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
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: "react",
      "react-dom": "react-dom",
      "react-reconciler": "react-reconciler",
      scheduler: "scheduler",
      "@react-three/fiber/node_modules/react": "react",
      "@react-three/fiber/node_modules/react-dom": "react-dom",
      "@react-three/fiber/node_modules/react-reconciler": "react-reconciler",
      "@react-three/fiber/node_modules/scheduler": "scheduler",
      "@react-three/drei/node_modules/react": "react",
      "@react-three/drei/node_modules/react-dom": "react-dom",
      "@react-three/drei/node_modules/react-reconciler": "react-reconciler",
      "@react-three/drei/node_modules/scheduler": "scheduler",
    };
    return config;
  },
};

export default nextConfig;
