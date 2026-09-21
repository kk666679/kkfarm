import React from 'react';
import { View, Text, ScrollView, StyleSheet, Share, TouchableOpacity } from 'react-native';
import { useTaskStore } from '@/stores';
import { colors, spacing } from '@/theme';

const TaskResultScreen: React.FC<{ route: any }> = ({ route }) => {
  const { taskId } = route.params;
  const { tasks } = useTaskStore();
  const task = tasks.find(t => t.id === taskId);

  const handleShare = async () => {
    if (!task) return;
    try {
      await Share.share({ message: JSON.stringify(task, null, 2) });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  if (!task) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>Task not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Task Result</Text>
        <Text style={styles.status}>{task.status.toUpperCase()}</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Task Details</Text>
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
          <Text style={styles.value}>{task.progress}%</Text>
        </View>
        {task.deviceId && (
          <View style={styles.row}>
            <Text style={styles.label}>Device ID:</Text>
            <Text style={styles.value}>{task.deviceId}</Text>
          </View>
        )}
        {task.startedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Started:</Text>
            <Text style={styles.value}>{new Date(task.startedAt).toLocaleString()}</Text>
          </View>
        )}
        {task.completedAt && (
          <View style={styles.row}>
            <Text style={styles.label}>Completed:</Text>
            <Text style={styles.value}>{new Date(task.completedAt).toLocaleString()}</Text>
          </View>
        )}
        {task.error && (
          <View style={styles.row}>
            <Text style={styles.label}>Error:</Text>
            <Text style={[styles.value, styles.errorText]}>{task.error}</Text>
          </View>
        )}
      </View>

      <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
        <Text style={styles.shareButtonText}>Share Result</Text>
      </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.success,
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    width: 120,
  },
  value: {
    fontSize: 14,
    color: colors.text,
    flex: 1,
  },
  errorText: {
    color: colors.error,
  },
  shareButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  loadingText: {
    color: colors.textSecondary,
  },
});

export default TaskResultScreen;
