import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface StatCardProps {
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  icon?: string;
  onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendValue, icon, onPress }) => {
  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return colors.success;
      case 'down':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '▲';
      case 'down':
        return '▼';
      default:
        return '';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        {icon && <Text style={styles.icon}>{icon}</Text>}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {trend && trendValue && (
        <View style={styles.trendContainer}>
          <Text style={[styles.trend, { color: getTrendColor() }]}>
            {getTrendIcon()} {trendValue}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.sm,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    minWidth: 140,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  icon: {
    fontSize: 20,
    marginRight: spacing.xs,
  },
  label: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
  },
  value: {
    ...typography.h2,
    color: colors.text,
  },
  trendContainer: {
    marginTop: spacing.xs,
  },
  trend: {
    ...typography.caption,
    fontWeight: '600',
  },
});

export default StatCard;
