const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/**
 * Metro configuration for React Native 0.87.1
 * https://reactnative.dev/docs/metro
 */
const defaultConfig = getDefaultConfig(__dirname);

const config = {
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: [...defaultConfig.resolver.sourceExts, 'json'],
  },
};

module.exports = mergeConfig(defaultConfig, config);
