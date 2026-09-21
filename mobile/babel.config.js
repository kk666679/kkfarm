module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@/types': './src/types',
          '@/services': './src/services',
          '@/contexts': './src/contexts',
          '@/components': './src/components',
          '@/screens': './src/screens',
          '@/utils': './src/utils',
          '@/navigation': './src/navigation',
          '@/theme': './src/theme',
          '@/stores': './src/stores',
          '@/query': './src/query',
          '@/sync': './src/sync',
          '@/worklets': './src/worklets',
          '@/storage': './src/storage',
          '@/hooks': './src/hooks',
          '@/agents': './src/agents',
          '@/stubs': './src/stubs',
        },
      },
    ],
  ],
};