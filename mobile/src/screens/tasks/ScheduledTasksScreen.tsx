import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing } from '@/theme';

const ScheduledTasksScreen: React.FC = () => {
  const mockScheduledTasks = [
    { id: '1', name: 'Daily App Test', scheduledAt: '2026-09-09T08:00:00Z', status: 'scheduled' },
    {
      id: '2',
      name: 'Weekly Performance Check',
      scheduledAt: '2026-09-10T14:00:00Z',
      status: 'scheduled',
    },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.taskItem}>
      <View>
        <Text style={styles.taskName}>{item.name}</Text>
        <Text style={styles.taskDate}>{new Date(item.scheduledAt).toLocaleString()}</Text>
      </View>
      <Text style={[styles.taskStatus, { color: colors.primary }]}>{item.status}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scheduled Tasks</Text>
      <FlatList
        data={mockScheduledTasks}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>No scheduled tasks</Text>}
      />
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
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  taskDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  taskStatus: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});

export default ScheduledTasksScreen;
