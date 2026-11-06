const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Only watch the mobile app itself — root node_modules is reached via resolver
config.watchFolders = [projectRoot];

// Resolve packages from root node_modules when not found locally
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

module.exports = withNativeWind(config, {
  input: path.join(projectRoot, 'global.css'),
  configPath: path.join(projectRoot, 'tailwind.config.js'),
});
