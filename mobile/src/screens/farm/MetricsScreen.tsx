import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFarmStore } from '@/stores';
import { useMetricsQuery } from '@/query';
import { colors, spacing, typography } from '@/theme';

const MetricsScreen: React.FC = () => {
  const { data: metrics, isLoading } = useMetricsQuery();
  const { fetchMetrics } = useFarmStore();

  React.useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  if (isLoading || !metrics) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Loading metrics...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>System Metrics</Text>
      <Text style={styles.generatedAt}>
        Generated: {new Date(metrics.generatedAt).toLocaleString()}
      </Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Devices</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>{metrics.devices.total}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Online</Text>
            <Text style={[styles.value, { color: colors.success }]}>{metrics.devices.online}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Offline</Text>
            <Text style={[styles.value, { color: colors.error }]}>{metrics.devices.offline}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Busy</Text>
            <Text style={[styles.value, { color: colors.warning }]}>{metrics.devices.busy}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Error</Text>
            <Text style={[styles.value, { color: colors.error }]}>{metrics.devices.error}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Starting</Text>
            <Text style={styles.value}>{metrics.devices.starting}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tasks</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>{metrics.tasks.total}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Queued</Text>
            <Text style={styles.value}>{metrics.tasks.queued}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Running</Text>
            <Text style={[styles.value, { color: colors.primary }]}>{metrics.tasks.running}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Completed</Text>
            <Text style={[styles.value, { color: colors.success }]}>{metrics.tasks.completed}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Failed</Text>
            <Text style={[styles.value, { color: colors.error }]}>{metrics.tasks.failed}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Cancelled</Text>
            <Text style={styles.value}>{metrics.tasks.cancelled}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Performance</Text>
        <View style={styles.grid}>
          <View style={styles.card}>
            <Text style={styles.label}>Success Rate</Text>
            <Text style={styles.value}>{metrics.tasks.successRate.toFixed(1)}%</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.label}>Avg Duration</Text>
            <Text style={styles.value}>{metrics.tasks.averageDurationSeconds.toFixed(1)}s</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.text,
    padding: spacing.lg,
  },
  generatedAt: {
    ...typography.caption,
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  card: {
    width: '48%',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  loadingText: {
    color: colors.textSecondary,
  },
});

export default MetricsScreen;
