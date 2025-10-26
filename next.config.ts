
import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
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
    const topReact = require.resolve("react");
    const topReactDOM = require.resolve("react-dom");
    
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: topReact,
      "react-dom": topReactDOM,
    };

    return config;
  },
};

export default nextConfig;
