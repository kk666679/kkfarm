import React from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { useDeviceStore, useTaskStore, useFarmStore } from '@/stores';
import { LoadingSpinner, ConnectionIndicator, MetricChart } from '@/components';
import StatCard from '@/components/dashboard/StatCard';
import { colors, spacing, typography } from '@/theme';
import type { Device, Task, MetricDataPoint } from '@/types';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '@/types';

const DashboardScreen: React.FC = () => {
  const {
    devices,
    fetchDevices: fetchDevicesFromStore,
    isLoading: devicesLoading,
  } = useDeviceStore();
  const { tasks, fetchTasks: fetchTasksFromStore, isLoading: tasksLoading } = useTaskStore();
  const {
    metrics,
    fetchMetrics: fetchMetricsFromStore,
    isLoading: metricsLoading,
  } = useFarmStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await Promise.all([fetchDevicesFromStore(), fetchTasksFromStore(), fetchMetricsFromStore()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (
    (devicesLoading || tasksLoading || metricsLoading) &&
    devices.length === 0 &&
    tasks.length === 0
  ) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  const onlineDevices = devices.filter((d: Device) => d.status === 'online').length;
  const busyDevices = devices.filter((d: Device) => d.status === 'busy').length;
  const errorDevices = devices.filter(
    (d: Device) => d.status === 'error' || d.status === 'offline'
  ).length;
  const runningTasks = tasks.filter((t: Task) => t.status === 'running').length;
  const completedTasks = tasks.filter((t: Task) => t.status === 'completed').length;
  const successRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  const recentActivity = [
    ...devices.slice(0, 3).map((d: Device) => ({
      id: `device-${d.id}`,
      title: d.name,
      description: `Status: ${d.status}`,
      timestamp: d.lastSeen,
    })),
    ...tasks.slice(0, 3).map((t: Task) => ({
      id: `task-${t.id}`,
      title: t.name,
      description: `Status: ${t.status}`,
      timestamp: t.startedAt || t.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  const cpuData: MetricDataPoint[] = React.useMemo(() => {
    if (!metrics) return [];
    const now = Date.now();
    return Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(now - (9 - i) * 60000).toISOString(),
      value: 30 + Math.random() * 40,
    }));
  }, [metrics]);

  const memoryData: MetricDataPoint[] = React.useMemo(() => {
    if (!metrics) return [];
    const now = Date.now();
    return Array.from({ length: 10 }, (_, i) => ({
      timestamp: new Date(now - (9 - i) * 60000).toISOString(),
      value: 40 + Math.random() * 35,
    }));
  }, [metrics]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <ConnectionIndicator />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Devices"
          value={devices.length}
          icon="📱"
          onPress={() => navigation.navigate('DevicesTab')}
        />
        <StatCard
          label="Online"
          value={onlineDevices}
          trend="up"
          trendValue={`${Math.round((onlineDevices / Math.max(devices.length, 1)) * 100)}%`}
          icon="🟢"
          onPress={() => navigation.navigate('DevicesTab')}
        />
        <StatCard
          label="Busy"
          value={busyDevices}
          trend="neutral"
          trendValue="Active"
          icon="🟡"
          onPress={() => navigation.navigate('DevicesTab')}
        />
        <StatCard
          label="Offline/Error"
          value={errorDevices}
          trend="down"
          trendValue="Check"
          icon="🔴"
          onPress={() => navigation.navigate('DevicesTab')}
        />
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          label="Total Tasks"
          value={tasks.length}
          icon="📋"
          onPress={() => navigation.navigate('TasksTab')}
        />
        <StatCard
          label="Running"
          value={runningTasks}
          trend="up"
          trendValue="Active"
          icon="▶️"
          onPress={() => navigation.navigate('TasksTab')}
        />
        <StatCard
          label="Completed"
          value={completedTasks}
          trend="up"
          trendValue={`${successRate}%`}
          icon="✅"
          onPress={() => navigation.navigate('TasksTab')}
        />
        <StatCard
          label="Success Rate"
          value={`${successRate}%`}
          icon="📊"
          onPress={() => navigation.navigate('FarmTab')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsRow}>
          <Text
            style={[styles.actionText, styles.actionButton]}
            onPress={() => navigation.navigate('TasksTab')}
          >
            Create Task
          </Text>
          <Text
            style={[styles.actionText, styles.actionButton]}
            onPress={() => navigation.navigate('DevicesTab')}
          >
            Register Device
          </Text>
          <Text
            style={[styles.actionText, styles.actionButton]}
            onPress={() => navigation.navigate('DevicesTab')}
          >
            View All Devices
          </Text>
        </View>
      </View>

      {cpuData.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Metrics</Text>
          <MetricChart data={cpuData} metricType="cpu" timeRange="1h" />
          <MetricChart data={memoryData} metricType="memory" timeRange="1h" />
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityList}>
          {recentActivity.map(item => (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityDot} />
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityDescription}>{item.description}</Text>
              </View>
            </View>
          ))}
          {recentActivity.length === 0 && <Text style={styles.emptyText}>No recent activity</Text>}
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: spacing.md,
    gap: spacing.md,
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.md,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButton: {
    padding: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.primary + '15',
  },
  actionText: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
  activityList: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 6,
    marginRight: spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  activityDescription: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
});

export default DashboardScreen;
