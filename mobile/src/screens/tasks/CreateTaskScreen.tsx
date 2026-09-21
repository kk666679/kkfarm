import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList, TaskType } from '@/types';
import { useTaskStore } from '@/stores';
import { useCreateTaskMutation } from '@/query';
import { Button, Input, LoadingSpinner } from '@/components';
import { colors, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<TasksStackParamList, 'CreateTask'>;

const TASK_TYPES = [
  { value: 'shell', label: 'Shell' },
  { value: 'tap', label: 'Tap' },
  { value: 'swipe', label: 'Swipe' },
  { value: 'screenshot', label: 'Screenshot' },
  { value: 'install_apk', label: 'Install APK' },
  { value: 'uninstall_apk', label: 'Uninstall APK' },
  { value: 'launch_app', label: 'Launch App' },
  { value: 'clear_app_data', label: 'Clear App Data' },
  { value: 'wait', label: 'Wait' },
  { value: 'sequence', label: 'Sequence' },
] as const;

const CreateTaskScreen: React.FC<Props> = ({ navigation }) => {
  const [type, setType] = useState<TaskType>('shell');
  const [priority, setPriority] = useState(0);
  const [payload, setPayload] = useState('{}');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMutation = useCreateTaskMutation();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    try {
      JSON.parse(payload);
    } catch {
      newErrors.payload = 'Payload must be valid JSON';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;
    try {
      const task = await createMutation.mutateAsync({
        type,
        priority,
        payload: JSON.parse(payload),
      });
      Alert.alert('Success', 'Task created successfully');
      navigation.navigate('TaskAssignment', { taskId: task.id });
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create task');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create Task</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Task Type</Text>
        <View style={styles.grid}>
          {TASK_TYPES.map(item => (
            <TouchableOpacity
              key={item.value}
              style={[styles.chip, type === item.value && styles.chipActive]}
              onPress={() => setType(item.value)}
            >
              <Text style={[styles.chipText, type === item.value && styles.chipTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Priority (0-100)</Text>
        <View style={styles.row}>
          {[0, 25, 50, 75, 100].map(p => (
            <TouchableOpacity
              key={p}
              style={[styles.chip, priority === p && styles.chipActive]}
              onPress={() => setPriority(p)}
            >
              <Text style={[styles.chipText, priority === p && styles.chipTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Input
          label="Payload (JSON)"
          value={payload}
          onChangeText={setPayload}
          error={errors.payload}
          placeholder='{"key": "value"}'
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Create Task"
          onPress={handleCreate}
          loading={createMutation.isPending}
          style={styles.button}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    ...typography.h1,
    color: colors.text,
    padding: spacing.lg,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.caption,
    color: colors.text,
  },
  chipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  button: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  actions: {
    padding: spacing.lg,
    gap: spacing.md,
  },
});

export default CreateTaskScreen;
