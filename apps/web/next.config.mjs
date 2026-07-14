/** Fail fast during production builds when the public API URL is missing or invalid. */
function readPublicApiBaseUrl() {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;
  return value?.trim() || undefined;
}

function assertProductionBuildEnv() {
  const apiBaseUrl = readPublicApiBaseUrl();

  if (!apiBaseUrl) {
    throw new Error(
      'Production build requires NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_API_URL). ' +
        'Set it in your environment or .env.production before running `pnpm build`.',
    );
  }

  try {
    new URL(apiBaseUrl);
  } catch {
    throw new Error(`Invalid NEXT_PUBLIC_API_BASE_URL: "${apiBaseUrl}". Must be a valid URL.`);
  }
}

if (process.argv.includes('build')) {
  assertProductionBuildEnv();
}

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
