import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '@/types';
import { useTaskStore } from '@/stores';
import { useCancelTaskMutation, useRetryTaskMutation } from '@/query';
import { StatusBadge, LoadingSpinner, Button, ProgressBar } from '@/components';
import { colors, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskDetail'>;

const TaskDetailScreen: React.FC<Props> = ({ route }) => {
  const { taskId } = route.params;
  const { tasks } = useTaskStore();
  const cancelMutation = useCancelTaskMutation();
  const retryMutation = useRetryTaskMutation();
  const task = tasks.find(t => t.id === taskId);

  if (!task) {
    return <LoadingSpinner message="Loading task..." />;
  }

  const handleCancel = async () => {
    try {
      await cancelMutation.mutateAsync(taskId);
    } catch (error: any) {
      console.error('Cancel error:', error);
    }
  };

  const handleRetry = async () => {
    try {
      await retryMutation.mutateAsync(taskId);
    } catch (error: any) {
      console.error('Retry error:', error);
    }
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(date)
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{task.type}</Text>
        <StatusBadge status={task.status} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Type:</Text>
          <Text style={styles.value}>{task.type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Priority:</Text>
          <Text style={styles.value}>{task.priority}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Progress:</Text>
          <View style={styles.progressContainer}>
            <ProgressBar progress={task.progress} showPercentage />
          </View>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Device ID:</Text>
          <Text style={styles.value}>{task.deviceId || '-'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Created:</Text>
          <Text style={styles.value}>{formatDate(task.createdAt)}</Text>
        </View>
        {task.startedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Started:</Text>
            <Text style={styles.value}>{formatDate(task.startedAt)}</Text>
          </View>
        )}
        {task.completedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Completed:</Text>
            <Text style={styles.value}>{formatDate(task.completedAt)}</Text>
          </View>
        )}
        {task.error && (
          <View style={styles.row}>
            <Text style={styles.label}>Error:</Text>
            <Text style={[styles.value, styles.errorText]}>{task.error}</Text>
          </View>
        )}
        {task.retryCount !== undefined && task.maxRetries !== undefined && (
          <View style={styles.row}>
            <Text style={styles.label}>Retry Count:</Text>
            <Text style={styles.value}>
              {task.retryCount} / {task.maxRetries}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        {(task.status === 'queued' || task.status === 'running') && (
          <Button
            title="Cancel Task"
            onPress={handleCancel}
            variant="danger"
            loading={cancelMutation.isPending}
          />
        )}
        {(task.status === 'failed' || task.status === 'cancelled') && (
          <Button
            title="Retry Task"
            onPress={handleRetry}
            variant="primary"
            loading={retryMutation.isPending}
          />
        )}
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
    flex: 1,
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
  label: {
    ...typography.body,
    color: colors.textSecondary,
    width: 120,
  },
  value: {
    ...typography.body,
    color: colors.text,
    flex: 1,
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  errorText: {
    color: colors.error,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});

export default TaskDetailScreen;
