import { Platform } from 'react-native';

export const PlatformAdaptations = {
  isIOS: Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  hasNotch: false,
  statusBarHeight: Platform.select({ ios: 44, android: 24 }) || 24,
  bottomBarHeight: Platform.select({ ios: 34, android: 0 }) || 0,
  iconPrefix: Platform.select({ ios: 'ios', android: 'md' }) || 'md',
  backHandlerAvailable: Platform.OS === 'android',
};

export const getPlatformIcon = (name: string): string => {
  if (Platform.OS === 'ios') {
    return `ios-${name}`;
  }
  return `md-${name}`;
};

export const formatDateTime = (date: Date): string => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

export default PlatformAdaptations;
