/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    // Handle MetaMask SDK react-native dependencies
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    // Ignore certain modules that aren't needed in browser
    config.externals = config.externals || [];
    config.externals.push({
      'react-native': 'react-native',
    });
    return config;
  },
};

module.exports = nextConfig;
