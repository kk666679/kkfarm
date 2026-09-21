import React, { useEffect } from 'react';
import { BackHandler, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

export const useAndroidBackHandler = (callback: () => boolean) => {
  if (Platform.OS !== 'android') return;

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', callback);
      return () => subscription.remove();
    }, [callback])
  );
};

export const useHapticOnChange = (deps: any[]) => {
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { triggerHaptic } = require('@/utils/AccessibilityHelpers');
    triggerHaptic('light');
  }, deps);
};

export default {
  useAndroidBackHandler,
  useHapticOnChange,
};
