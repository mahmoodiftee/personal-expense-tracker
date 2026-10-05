const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('node:path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Watch the monorepo so Metro can resolve workspace packages (@finance/*).
config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

// pnpm nests packages under .pnpm — keep hierarchical lookup so transitive
// deps (e.g. `debug` from @expo/router-server) resolve correctly.
config.resolver.disableHierarchicalLookup = false;

// Force a single copy of React / React Query so hooks from @finance/client
// share the same context as PersistQueryClientProvider in the app.
const singletonPackages = [
  'react',
  'react-native',
  '@tanstack/react-query',
  '@tanstack/react-query-persist-client',
  '@tanstack/query-async-storage-persister',
  '@tanstack/query-core',
];

function isSingletonModule(moduleName) {
  return singletonPackages.some((pkg) => moduleName === pkg || moduleName.startsWith(`${pkg}/`));
}

const reactQueryDir = path.dirname(
  require.resolve('@tanstack/react-query/package.json', { paths: [projectRoot] }),
);

function resolveSingleton(moduleName) {
  const resolveFrom =
    moduleName === '@tanstack/query-core' || moduleName.startsWith('@tanstack/query-core/')
      ? [reactQueryDir, projectRoot]
      : [projectRoot];
  return require.resolve(moduleName, { paths: resolveFrom });
}

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (isSingletonModule(moduleName)) {
    try {
      return {
        type: 'sourceFile',
        filePath: resolveSingleton(moduleName),
      };
    } catch {
      // Fall through to default resolution if a subpath is unavailable.
    }
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './src/styles/global.css' });
