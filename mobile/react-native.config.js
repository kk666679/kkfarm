const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

module.exports = {
  ...config,
  project: {
    ios: {},
    android: {},
  },
  newArchEnabled: true,
  dependencies: {
    ...config.dependencies,
  },
};