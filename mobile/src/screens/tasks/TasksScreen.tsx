import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList, TaskStatus, TaskType } from '@/types';
import { useTaskStore, useNetworkStore } from '@/stores';
import {
  TaskCard,
  LoadingSpinner,
  EmptyState,
  SearchInput,
  FilterChip,
  OfflineBanner,
} from '@/components';
import { colors, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<TasksStackParamList, 'TasksList'>;

const TasksScreen: React.FC<Props> = ({ navigation }) => {
  const { tasks, isLoading, fetchTasks } = useTaskStore();
  const { isConnected } = useNetworkStore();
  const [searchText, setLocalSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const statusOptions: TaskStatus[] = ['queued', 'running', 'completed', 'failed', 'cancelled'];
  const typeOptions: TaskType[] = [
    'shell',
    'tap',
    'swipe',
    'screenshot',
    'install_apk',
    'uninstall_apk',
    'launch_app',
    'clear_app_data',
    'wait',
    'sequence',
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  if (isLoading && tasks.length === 0) {
    return <LoadingSpinner message="Loading tasks..." />;
  }

  return (
    <View style={styles.container}>
      <OfflineBanner
        cacheAge={
          isConnected
            ? undefined
            : Date.now() -
              (tasks[0]?.createdAt ? new Date(tasks[0].createdAt).getTime() : Date.now())
        }
      />
      <View style={styles.header}>
        <Text style={styles.title}>Tasks</Text>
        <Text style={styles.count}>{tasks.length} total</Text>
      </View>
      <SearchInput
        placeholder="Search tasks..."
        value={searchText}
        onChangeText={setLocalSearchText}
        onClear={() => setLocalSearchText('')}
      />
      <View style={styles.filters}>
        {statusOptions.map(status => (
          <FilterChip
            key={status}
            label={status}
            selected={false}
            onPress={() => {
              const current = useTaskStore.getState().filters.status;
              useTaskStore.getState().setFilters({
                status: current.includes(status)
                  ? current.filter(s => s !== status)
                  : [...current, status],
              });
            }}
          />
        ))}
      </View>
      <View style={styles.filters}>
        {typeOptions.map(type => (
          <FilterChip
            key={type}
            label={type}
            selected={false}
            onPress={() => {
              const current = useTaskStore.getState().filters.type;
              useTaskStore.getState().setFilters({
                type: current.includes(type) ? current.filter(t => t !== type) : [...current, type],
              });
            }}
          />
        ))}
      </View>
      {tasks.length === 0 ? (
        <EmptyState
          icon="clipboard-list-outline"
          title="No Tasks"
          message="Create your first task to automate device operations"
          actionLabel="Create Task"
          onAction={() => navigation.navigate('CreateTask')}
        />
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
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
  count: {
    ...typography.body,
    color: colors.textSecondary,
  },
  filters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  list: {
    padding: spacing.md,
  },
});

export default TasksScreen;
