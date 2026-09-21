import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TasksStackParamList } from '@/types';
import { useTaskStore } from '@/stores';
import { useDeviceStore } from '@/stores';
import { colors, spacing } from '@/theme';
import type { Device } from '@/types';

type Props = NativeStackScreenProps<TasksStackParamList, 'TaskAssignment'>;

const TaskAssignmentScreen: React.FC<Props> = ({ route, navigation }) => {
  const { taskId } = route.params;
  const { devices } = useDeviceStore();
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);

  const availableDevices = devices.filter(d => d.status === 'online');

  const toggleDevice = (deviceId: string) => {
    setSelectedDevices(prev => {
      if (prev.includes(deviceId)) {
        return prev.filter(id => id !== deviceId);
      }
      if (prev.length >= 20) {
        Alert.alert('Limit reached', 'You can select up to 20 devices.');
        return prev;
      }
      return [...prev, deviceId];
    });
  };

  const handleAssign = async () => {
    if (selectedDevices.length === 0) {
      Alert.alert('No devices selected', 'Please select at least one device.');
      return;
    }
    Alert.alert(
      'Info',
      `Task ${taskId} would be assigned to ${selectedDevices.length} device(s). Assignment is handled by the backend.`
    );
    navigation.goBack();
  };

  const renderDevice = ({ item }: { item: Device }) => (
    <TouchableOpacity
      style={[styles.deviceItem, selectedDevices.includes(item.id) && styles.deviceItemSelected]}
      onPress={() => toggleDevice(item.id)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceMeta}>
          {item.provider} • Battery: {item.batteryLevel ?? '-'}%
        </Text>
      </View>
      <View style={[styles.checkbox, selectedDevices.includes(item.id) && styles.checkboxSelected]}>
        {selectedDevices.includes(item.id) && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assign Task</Text>
      <Text style={styles.subtitle}>Selected: {selectedDevices.length}/20</Text>
      <FlatList
        data={availableDevices}
        renderItem={renderDevice}
        keyExtractor={item => item.id}
        style={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No available devices</Text>}
      />
      <TouchableOpacity
        onPress={handleAssign}
        style={styles.assignButton}
        disabled={selectedDevices.length === 0}
      >
        <Text style={styles.assignButtonText}>Assign to {selectedDevices.length} Device(s)</Text>
      </TouchableOpacity>
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
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  list: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  deviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  deviceItemSelected: {
    borderColor: colors.primary,
    borderWidth: 1,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  deviceMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: 'bold',
  },
  assignButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  assignButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '600',
  },
  empty: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.lg,
  },
});

export default TaskAssignmentScreen;
