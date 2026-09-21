declare module 'victory-native';
declare module 'expo-sqlite';
declare module 'react-native-fs';
declare module 'zod';
declare module 'react-native-worklets';
declare module 'react-native-websocket-service';
declare module 'meridian-lite';
declare module 'react-native-haptic-feedback';

declare const TextDecoder: {
  new (encoding?: string): {
    decode(input: ArrayBuffer | Uint8Array, options?: { stream?: boolean }): string;
  };
};
