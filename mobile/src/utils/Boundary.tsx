import React, { Suspense } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';
import LoadingSpinner from '@/components/LoadingSpinner';

const Fallback: React.FC<{ error?: Error }> = ({ error }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Something went wrong</Text>
    {error && <Text style={styles.message}>{error.message}</Text>}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  message: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error?: Error }>
) => {
  const Wrapped: React.FC<P> = props => {
    const [error, setError] = React.useState<Error | undefined>(undefined);
    try {
      return (
        <React.Fragment>
          {error ? <Fallback error={error} /> : <Component {...props} />}
        </React.Fragment>
      );
    } catch (e) {
      setError(e as Error);
      return <Fallback error={error} />;
    }
  };
  return Wrapped;
};

export default Fallback;
