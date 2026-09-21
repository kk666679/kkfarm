import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';

interface OfflineBannerProps {
  cacheAge?: number;
}

const OfflineBanner: React.FC<OfflineBannerProps> = ({ cacheAge }) => {
  const formatAge = () => {
    if (!cacheAge) return '';
    const minutes = Math.floor(cacheAge / 60000);
    if (minutes < 1) return 'just now';
    if (minutes === 1) return '1 min ago';
    return `${minutes} mins ago`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <View style={styles.textContainer}>
        <Text style={styles.title}>You are offline</Text>
        {cacheAge && <Text style={styles.subtitle}>Showing cached data from {formatAge()}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '20',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.warning,
  },
  icon: {
    fontSize: 18,
    marginRight: spacing.sm,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default OfflineBanner;
