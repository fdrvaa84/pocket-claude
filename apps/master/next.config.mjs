/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
    // ssh2 имеет native .node binding — не бандлим его webpack'ом, оставляем внешним
    serverComponentsExternalPackages: ['ssh2'],
  },
  // Transpile monorepo packages
  transpilePackages: ['@autmzr/command-protocol'],
};
export default nextConfig;
