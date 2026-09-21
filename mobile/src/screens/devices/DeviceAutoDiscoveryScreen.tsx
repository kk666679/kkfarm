import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useDeviceStore } from '@/stores';
import { colors, spacing } from '@/theme';

const DeviceAutoDiscoveryScreen: React.FC = () => {
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<string[]>([]);
  const { registerDevice } = useDeviceStore();

  useEffect(() => {
    const mockDiscovery = async () => {
      await new Promise(resolve => setTimeout(() => resolve(undefined), 1000));
      setDiscoveredDevices([
        { id: '1', name: 'Pixel 7', provider: 'manual', ip: '192.168.1.101' },
        { id: '2', name: 'iPhone 15', provider: 'manual', ip: '192.168.1.102' },
      ]);
    };
    mockDiscovery();
  }, []);

  const toggleDevice = (deviceId: string) => {
    setSelectedDevices(prev =>
      prev.includes(deviceId) ? prev.filter(id => id !== deviceId) : [...prev, deviceId]
    );
  };

  const handleRegisterSelected = async () => {
    if (selectedDevices.length === 0) {
      Alert.alert('No devices selected', 'Please select devices to register.');
      return;
    }
    for (const deviceId of selectedDevices) {
      const device = discoveredDevices.find(d => d.id === deviceId);
      if (device) {
        await registerDevice({
          name: device.name,
          provider: device.provider || 'manual',
        });
      }
    }
    Alert.alert('Success', `${selectedDevices.length} device(s) registered.`);
    setSelectedDevices([]);
  };

  const renderDevice = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.deviceItem, selectedDevices.includes(item.id) && styles.deviceItemSelected]}
      onPress={() => toggleDevice(item.id)}
    >
      <View>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceMeta}>
          {item.provider} • {item.ip}
        </Text>
      </View>
      <View style={[styles.checkbox, selectedDevices.includes(item.id) && styles.checkboxSelected]}>
        {selectedDevices.includes(item.id) && <Text style={styles.checkmark}>✓</Text>}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Discover Devices</Text>
      <FlatList
        data={discoveredDevices}
        renderItem={renderDevice}
        keyExtractor={item => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Scanning for devices...</Text>}
      />
      {discoveredDevices.length > 0 && (
        <TouchableOpacity onPress={handleRegisterSelected} style={styles.registerButton}>
          <Text style={styles.registerButtonText}>
            Register Selected ({selectedDevices.length})
          </Text>
        </TouchableOpacity>
      )}
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
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
  deviceItemSelected: {
    borderColor: colors.primary,
    borderWidth: 1,
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
  registerButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    margin: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerButtonText: {
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

export default DeviceAutoDiscoveryScreen;
