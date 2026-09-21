import React, { memo, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/theme';
import type { Device } from '@/types';

interface DeviceCardProps {
  device: Device;
  onPress: (device: Device) => void;
  showBattery?: boolean;
  showCurrentTask?: boolean;
}

const DeviceCard: React.FC<DeviceCardProps> = memo(
  ({ device, onPress, showBattery = true, showCurrentTask = false }) => {
    const handlePress = useCallback(() => {
      onPress(device);
    }, [device, onPress]);

    const statusColor = useMemo(() => {
      switch (device.status) {
        case 'online':
          return colors.success;
        case 'busy':
          return colors.warning;
        case 'error':
        case 'offline':
          return colors.error;
        default:
          return colors.textSecondary;
      }
    }, [device.status]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        style={styles.container}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={`${device.name}, ${device.status}`}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{device.name}</Text>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
          <Text style={styles.meta}>
            {device.provider}
            {device.model ? ` • ${device.model}` : ''}
          </Text>
          {showBattery && <Text style={styles.battery}>Battery: {device.batteryLevel}%</Text>}
        </View>
      </TouchableOpacity>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: spacing.sm,
  },
  meta: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  battery: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});

export default DeviceCard;
