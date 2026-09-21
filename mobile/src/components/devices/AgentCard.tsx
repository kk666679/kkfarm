import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface AgentCardProps {
  name: string;
  status: 'active' | 'idle' | 'error' | 'offline';
  taskCount: number;
  deviceCount: number;
  onPress?: () => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ name, status, taskCount, deviceCount, onPress }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'active':
        return colors.success;
      case 'idle':
        return colors.warning;
      case 'error':
        return colors.error;
      default:
        return colors.textSecondary;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={[styles.dot, { backgroundColor: getStatusColor() }]} />
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
      </View>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{taskCount}</Text>
          <Text style={styles.statLabel}>Tasks</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{deviceCount}</Text>
          <Text style={styles.statLabel}>Devices</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginVertical: spacing.xs,
    marginHorizontal: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: spacing.sm,
  },
  name: {
    ...typography.h3,
    color: colors.text,
    flex: 1,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    ...typography.h2,
    color: colors.text,
  },
  statLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
});

export default AgentCard;
