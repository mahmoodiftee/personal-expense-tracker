/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Compile the shared workspace package from source (no pre-build step needed).
  transpilePackages: ['@finance/shared'],
  // Standalone output produces a minimal, container-friendly server bundle.
  output: 'standalone',
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
