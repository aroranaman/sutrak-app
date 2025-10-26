
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
  experimental: {
    // Empty for now, but keeping the key in case it's needed later
  },
  // Add allowedDevOrigins at the top level
  allowedDevOrigins: ['**/*.cloudworkstations.dev'],
  webpack: (config) => {
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      react: require.resolve('react'),
      'react-dom': require.resolve('react-dom'),
    };
    return config;
  },
};

export default nextConfig;
