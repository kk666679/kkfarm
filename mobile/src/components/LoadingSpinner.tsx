import React, { FC } from 'react';
import { View, ActivityIndicator, Text, StyleSheet, AccessibilityInfo } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'small' | 'large';
  fullscreen?: boolean;
}

const LoadingSpinner: FC<LoadingSpinnerProps> = ({
  message,
  size = 'large',
  fullscreen = false,
}) => {
  React.useEffect(() => {
    if (message) {
      AccessibilityInfo.announceForAccessibility(message);
    }
  }, [message]);

  return (
    <View style={[styles.container, fullscreen && styles.fullscreen]}>
      <ActivityIndicator size={size} color={colors.primary} accessibilityLabel="Loading" />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullscreen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
});

export default LoadingSpinner;
