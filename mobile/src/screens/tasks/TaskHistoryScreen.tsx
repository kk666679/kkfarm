import React from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useTaskStore } from '@/stores';
import { colors, spacing } from '@/theme';
import type { Task } from '@/types';

const TaskHistoryScreen: React.FC = () => {
  const { tasks } = useTaskStore();

  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const failedTasks = tasks.filter(t => t.status === 'failed').length;
  const cancelledTasks = tasks.filter(t => t.status === 'cancelled').length;
  const totalTasks = tasks.length;

  const pieData = [
    { x: 'Completed', y: completedTasks },
    { x: 'Failed', y: failedTasks },
    { x: 'Cancelled', y: cancelledTasks },
  ];

  const renderTask = ({ item }: { item: Task }) => (
    <View style={styles.taskItem}>
      <Text style={styles.taskType}>{item.type}</Text>
      <Text style={styles.taskStatus}>{item.status}</Text>
      <Text style={styles.taskDate}>
        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Task History</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalTasks}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.success }]}>{completedTasks}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: colors.error }]}>{failedTasks}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Distribution</Text>
        <View style={styles.distribution}>
          {pieData.map((item, index) => (
            <View
              key={item.x}
              style={[
                styles.distributionItem,
                { borderLeftColor: [colors.success, colors.error, colors.textSecondary][index] },
              ]}
            >
              <Text style={styles.distributionLabel}>{item.x}</Text>
              <Text style={styles.distributionValue}>{item.y}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Tasks</Text>
        <FlatList
          data={tasks.slice(0, 20)}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No tasks yet</Text>}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  distribution: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  distributionItem: {
    padding: spacing.md,
    borderRadius: 8,
    borderLeftWidth: 4,
    backgroundColor: colors.surface,
    minWidth: 80,
    alignItems: 'center',
  },
  distributionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  distributionValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 8,
  },
  taskType: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  taskStatus: {
    fontSize: 12,
    color: colors.textSecondary,
    textTransform: 'capitalize',
  },
  taskDate: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});

export default TaskHistoryScreen;
