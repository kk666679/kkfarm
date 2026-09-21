import React from 'react';
import { Platform, AccessibilityInfo } from 'react-native';
import { colors } from '@/theme';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const Haptics = {
  impactAsync: (style: any) =>
    ReactNativeHapticFeedback.trigger('impactLight', { enableVibrateFallback: true }),
  notificationAsync: (type: any) => {
    const mapping: Record<string, string> = {
      Success: 'notificationSuccess',
      Warning: 'notificationWarning',
      Error: 'notificationError',
    };
    ReactNativeHapticFeedback.trigger(mapping[type] || 'notificationSuccess', {
      enableVibrateFallback: true,
    });
  },
};

export const triggerHaptic = (
  type: 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error' = 'medium'
) => {
  if (Platform.OS === 'ios' || Platform.OS === 'android') {
    const styleMap: Record<string, string> = {
      light: 'impactLight',
      medium: 'impactMedium',
      heavy: 'impactHeavy',
      success: 'notificationSuccess',
      warning: 'notificationWarning',
      error: 'notificationError',
    };
    ReactNativeHapticFeedback.trigger(styleMap[type] || 'impactMedium', {
      enableVibrateFallback: true,
    });
  }
};

export const announceForAccessibility = (message: string) => {
  AccessibilityInfo.announceForAccessibility(message);
};

export const getAccessibilityLabel = (elementName: string, value?: string): string => {
  return value ? `${elementName}: ${value}` : elementName;
};

export const AccessibilityHelpers = {
  triggerHaptic,
  announceForAccessibility,
  getAccessibilityLabel,
};

export default AccessibilityHelpers;
