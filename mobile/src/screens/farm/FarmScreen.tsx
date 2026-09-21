import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/types';
import { useFarmStore, useNetworkStore } from '@/stores';
import { useMetricsQuery } from '@/query';
import { LoadingSpinner, ConnectionIndicator, Button } from '@/components';
import { colors, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<FarmStackParamList, 'FarmOverview'>;

const FarmScreen: React.FC<Props> = ({ navigation }) => {
  const { metrics, fetchMetrics } = useFarmStore();
  const { isConnected } = useNetworkStore();
  const { data: liveMetrics, isLoading } = useMetricsQuery();

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 10000);
    return () => clearInterval(interval);
  }, []);

  const displayMetrics = liveMetrics || metrics;

  if (isLoading && !displayMetrics) {
    return <LoadingSpinner message="Loading farm metrics..." />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Farm Control</Text>
        <ConnectionIndicator />
      </View>

      {displayMetrics && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Metrics</Text>
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{displayMetrics.devices.total}</Text>
              <Text style={styles.metricLabel}>Total Devices</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{displayMetrics.devices.online}</Text>
              <Text style={styles.metricLabel}>Online</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{displayMetrics.tasks.total}</Text>
              <Text style={styles.metricLabel}>Total Tasks</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{displayMetrics.tasks.running}</Text>
              <Text style={styles.metricLabel}>Running</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{displayMetrics.tasks.completed}</Text>
              <Text style={styles.metricLabel}>Completed</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{displayMetrics.tasks.failed}</Text>
              <Text style={styles.metricLabel}>Failed</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{displayMetrics.tasks.successRate.toFixed(1)}%</Text>
              <Text style={styles.metricLabel}>Success Rate</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {displayMetrics.tasks.averageDurationSeconds.toFixed(1)}s
              </Text>
              <Text style={styles.metricLabel}>Avg Duration</Text>
            </View>
          </View>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Breakdown</Text>
        {displayMetrics && (
          <View style={styles.deviceBreakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Online</Text>
              <Text style={[styles.breakdownValue, { color: colors.success }]}>
                {displayMetrics.devices.online}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Offline</Text>
              <Text style={[styles.breakdownValue, { color: colors.error }]}>
                {displayMetrics.devices.offline}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Busy</Text>
              <Text style={[styles.breakdownValue, { color: colors.warning }]}>
                {displayMetrics.devices.busy}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Error</Text>
              <Text style={[styles.breakdownValue, { color: colors.error }]}>
                {displayMetrics.devices.error}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Starting</Text>
              <Text style={[styles.breakdownValue, { color: colors.warning }]}>
                {displayMetrics.devices.starting}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Stopping</Text>
              <Text style={[styles.breakdownValue, { color: colors.warning }]}>
                {displayMetrics.devices.stopping}
              </Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.buttonRow}>
          <View style={{ flex: 1, marginRight: spacing.sm }}>
            <Button
              title="Metrics"
              onPress={() => navigation.navigate('Metrics')}
              variant="outline"
            />
          </View>
          <View style={{ flex: 1, marginLeft: spacing.sm }}>
            <Button title="Logs" onPress={() => navigation.navigate('Logs')} variant="outline" />
          </View>
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  title: {
    ...typography.h1,
    color: colors.text,
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
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    backgroundColor: colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricValue: {
    ...typography.h2,
    color: colors.primary,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  deviceBreakdown: {
    gap: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  breakdownLabel: {
    ...typography.body,
    color: colors.text,
  },
  breakdownValue: {
    ...typography.body,
    fontWeight: '600',
  },
  actions: {
    padding: spacing.lg,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});

export default FarmScreen;
