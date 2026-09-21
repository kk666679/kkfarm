import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface ErrorFallbackProps {
  error: Error;
  resetError?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  return (
    <View style={styles.container}>
      <Icon name="alert-circle-outline" size={48} color={colors.error} />
      <Text style={styles.title}>Something went wrong</Text>
      <Text style={styles.message}>{error.message}</Text>
      {resetError && (
        <TouchableOpacity onPress={resetError} style={styles.button}>
          <Text style={styles.buttonText}>Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginTop: spacing.md,
  },
  message: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  button: {
    marginTop: spacing.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorFallback;
