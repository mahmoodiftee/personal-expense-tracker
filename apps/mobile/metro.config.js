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

module.exports = withNativeWind(config, { input: './src/styles/global.css' });
