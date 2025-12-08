const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Exclude problematic directories from watchman
config.watchFolders = config.watchFolders || [];
config.resolver = config.resolver || {};
config.resolver.blacklistRE = /node_modules\/(@emnapi\/runtime\/dist|@tybys\/wasm-util\/lib\/cjs\/wasi)/;

module.exports = withNativeWind(config, { input: "./global.css" });

