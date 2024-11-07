const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push(
  'bin',
  'json'
);

// Add this to ensure JSON files are processed correctly
defaultConfig.resolver.sourceExts.push('json');

module.exports = defaultConfig; 