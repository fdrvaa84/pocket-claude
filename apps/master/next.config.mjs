/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: { bodySizeLimit: '10mb' },
  },
  // Transpile monorepo packages
  transpilePackages: ['@pocket-claude/protocol'],
};
export default nextConfig;
