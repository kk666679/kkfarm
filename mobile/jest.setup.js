const preferences = new Map();

class MockSQLiteDatabase {
  async execAsync(_sql) {}

  async runAsync(sql, params) {
    const normalized = sql.toLowerCase().trim();
    if (normalized.startsWith('insert') || normalized.startsWith('replace')) {
      if (params.length >= 2) {
        preferences.set(String(params[0]), String(params[1]));
      }
    } else if (normalized.startsWith('delete')) {
      if (normalized.includes('where')) {
        if (params.length >= 1) {
          preferences.delete(String(params[0]));
        }
      } else {
        preferences.clear();
      }
    } else if (normalized.startsWith('update')) {
      if (params.length >= 2) {
        const keyParamIndex = params.length >= 3 ? params.length - 2 : 0;
        const valueParamIndex = params.length >= 3 ? params.length - 1 : 1;
        preferences.set(String(params[keyParamIndex]), String(params[valueParamIndex]));
      }
    }
  }

  async getFirstAsync(sql, params) {
    const normalized = sql.toLowerCase().trim();
    if (normalized.startsWith('select') && normalized.includes('from preferences')) {
      const keyMatch = sql.match(/where\s+key\s*=\s*\?/i);
      if (keyMatch && params.length >= 1) {
        const value = preferences.get(String(params[0]));
        if (value !== undefined) {
          return { value };
        }
        return null;
      }
    }
    if (normalized.includes('count(')) {
      return { count: preferences.size };
    }
    if (normalized.includes('sum(')) {
      return { total: 0 };
    }
    return null;
  }

  async getAllAsync(_sql, _params) {
    return [];
  }

  async closeAsync() {}
}

let mockDb = new MockSQLiteDatabase();

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(async () => mockDb),
  SQLiteDatabase: class SQLiteDatabase {},
}));

jest.mock('react-native-keychain', () => ({
  setInternetCredentials: jest.fn(async () => {}),
  getInternetCredentials: jest.fn(async () => null),
  setGenericPassword: jest.fn(async () => {}),
  getGenericPassword: jest.fn(async () => null),
  resetGenericPassword: jest.fn(async () => {}),
  ACCESSIBLE: {
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 'WhenUnlockedThisDeviceOnly',
  },
}));

jest.mock('@react-native-community/netinfo', () => ({
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(() =>
      Promise.resolve({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
      })
    ),
  },
}));

jest.mock('react-native-haptic-feedback', () => ({
  trigger: jest.fn(),
  default: { trigger: jest.fn() },
}));

jest.mock('react-native-fs', () => ({
  RNFSFileTypeRegular: 'regular',
  RNFSFileTypeDirectory: 'directory',
  readDir: jest.fn(async () => []),
  readFile: jest.fn(async () => ''),
  writeFile: jest.fn(async () => {}),
  appendFile: jest.fn(async () => {}),
  deleteFile: jest.fn(async () => {}),
  exists: jest.fn(async () => false),
  mkdir: jest.fn(async () => {}),
  unlink: jest.fn(async () => {}),
  moveFile: jest.fn(async () => {}),
  copyFile: jest.fn(async () => {}),
  downloadFile: jest.fn(() => ({ jobId: 1, promise: Promise.resolve({ jobId: 1, status: 0 }) })),
  uploadFiles: jest.fn(() => ({ jobId: 1, promise: Promise.resolve({ jobId: 1 }) })),
  stopUpload: jest.fn(async () => {}),
  stopDownload: jest.fn(async () => {}),
  readDirectory: jest.fn(async () => []),
  copyFileAssets: jest.fn(async () => {}),
  copyFileAssetsIOS: jest.fn(async () => {}),
  copyAssetsVideoIOS: jest.fn(async () => {}),
  pathForGroup: jest.fn(() => ''),
  getFSInfo: jest.fn(async () => []),
  getAllExternalFilesDirs: jest.fn(async () => []),
  touch: jest.fn(async () => {}),
  stat: jest.fn(async () => null),
}));

jest.mock(
  'react-native',
  () => ({
    Platform: {
      OS: 'ios',
      select: obj =>
        obj && obj.ios !== undefined
          ? obj.ios
          : obj && obj.android !== undefined
            ? obj.android
            : undefined,
      Version: '99.0.0',
      isPad: false,
      isTVOS: false,
    },
    AppState: {
      currentState: 'active',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    NativeModules: {
      ...jest.fn(() => ({})),
    },
    Dimensions: {
      get: jest.fn(() => ({ width: 375, height: 812 })),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    },
    StyleSheet: {
      create: styles => styles,
      flatten: jest.fn(),
      compose: jest.fn(),
    },
    Text: 'Text',
    View: 'View',
    ScrollView: 'ScrollView',
    TouchableOpacity: 'TouchableOpacity',
    TextInput: 'TextInput',
    Image: 'Image',
    Alert: {
      alert: jest.fn(),
    },
    StatusBar: 'StatusBar',
    KeyboardAvoidingView: 'KeyboardAvoidingView',
    Share: {
      share: jest.fn(),
    },
    FlatList: 'FlatList',
    ActivityIndicator: 'ActivityIndicator',
    Switch: 'Switch',
    SafeAreaView: 'SafeAreaView',
    requireNativeComponent: jest.fn(),
    UIManager: {
      getViewManagerConfig: jest.fn(),
    },
    findNodeHandle: jest.fn(),
    AccessibilityInfo: {
      announceForAccessibility: jest.fn(),
      isScreenReaderEnabled: jest.fn(() => Promise.resolve(false)),
    },
    Haptics: {
      impactAsync: jest.fn(),
      notificationAsync: jest.fn(),
    },
    NativeEventEmitter: jest.fn(),
    DeviceEventEmitter: {
      addListener: jest.fn(() => ({ remove: jest.fn() })),
    },
  }),
  { virtual: true }
);

global.__DEV__ = true;

if (typeof global.self === 'undefined') {
  global.self = global;
}

if (typeof global.HermesInternal === 'undefined') {
  global.HermesInternal = {
    getRuntimeProperties: () => ({}),
  };
}
