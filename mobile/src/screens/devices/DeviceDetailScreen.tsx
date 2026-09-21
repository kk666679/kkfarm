import React from 'react';
import { View, Text, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DevicesStackParamList } from '@/types';
import { useDeviceStore } from '@/stores';
import { StatusBadge, LoadingSpinner, Button, MetricChart } from '@/components';
import { colors, spacing, typography } from '@/theme';
import { HealthReportGenerator } from '@/utils';
import type { DeviceDetails } from '@/types';

type Props = NativeStackScreenProps<DevicesStackParamList, 'DeviceDetail'>;

const DeviceDetailScreen: React.FC<Props> = ({ route }) => {
  const { deviceId } = route.params;
  const { devices, fetchDevices } = useDeviceStore();
  const device = devices.find(d => d.id === deviceId);

  React.useEffect(() => {
    if (!device) {
      fetchDevices();
    }
  }, [device]);

  if (!device) {
    return <LoadingSpinner message="Loading device..." />;
  }

  const generateMockHistory = (base: number, variance: number, points: number = 20) => {
    const now = Date.now();
    return Array.from({ length: points }).map((_, i) => ({
      timestamp: new Date(now - (points - i) * 180000).toISOString(),
      value: Math.min(100, Math.max(0, base + (Math.random() - 0.5) * variance)),
    }));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.name}>{device.name}</Text>
          <Text style={styles.platform}>{device.provider}</Text>
        </View>
        <StatusBadge status={device.status} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Info</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Provider:</Text>
          <Text style={styles.value}>{device.provider || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Android Version:</Text>
          <Text style={styles.value}>{device.androidVersion || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>API Level:</Text>
          <Text style={styles.value}>{device.apiLevel ?? '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ADB Host:</Text>
          <Text style={styles.value}>{device.adbHost || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>ADB Port:</Text>
          <Text style={styles.value}>{device.adbPort ?? '-'}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Metrics</Text>
        <View style={styles.metricRow}>
          <Text style={styles.label}>Battery Level:</Text>
          <Text style={[styles.value, (device.batteryLevel ?? 100) < 20 && styles.warning]}>
            {device.batteryLevel ?? '-'}%
          </Text>
        </View>
        <View style={styles.metricRow}>
          <Text style={styles.label}>Status:</Text>
          <StatusBadge status={device.status} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>24h Trend</Text>
        <MetricChart
          data={generateMockHistory(device.batteryLevel ?? 50, 15)}
          metricType="cpu"
          warningThreshold={20}
          errorThreshold={10}
        />
      </View>

      <View style={styles.actions}>
        <Button title="Assign Task" onPress={() => {}} variant="primary" />
        <View style={styles.secondaryActions}>
          <Button title="View Metrics" onPress={() => {}} variant="outline" />
          <Button
            title="Export Report"
            onPress={() => {
              const report = HealthReportGenerator.generateJSON(device as DeviceDetails, {
                totalTasksCompleted: 0,
                successRate: 1,
                averageExecutionTime: 0,
                uptime: 0,
              });
              Share.share({ message: report });
            }}
            variant="outline"
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  name: {
    ...typography.h2,
    color: colors.text,
  },
  platform: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  section: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    marginTop: spacing.md,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.body,
    color: colors.textSecondary,
    width: 140,
  },
  value: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  warning: {
    color: colors.warning,
    fontWeight: '600',
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});

export default DeviceDetailScreen;
