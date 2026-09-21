import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '@/theme';
import type { DeviceStatus, TaskStatus } from '@/types';

interface StatusBadgeProps {
  status: DeviceStatus | TaskStatus;
  size?: 'small' | 'medium' | 'large';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'medium' }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
      case 'completed':
        return colors.success;
      case 'starting':
      case 'queued':
      case 'running':
        return colors.warning;
      case 'error':
      case 'failed':
      case 'offline':
      case 'stopping':
      case 'cancelled':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, fontSize: 12 };
      case 'large':
        return { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, fontSize: 16 };
      default:
        return { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, fontSize: 14 };
    }
  };

  return (
    <View style={[styles.badge, { backgroundColor: getStatusColor() + '20' }]}>
      <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
      <Text style={[styles.text, { color: getStatusColor() }, getSizeStyles()]}>
        {status.replace('_', ' ')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  text: {
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default StatusBadge;
