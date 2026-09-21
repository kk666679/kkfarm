import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { DevicesStackParamList } from '@/types';
import { useDeviceStore } from '@/stores';
import { useCreateDeviceMutation } from '@/query';
import { Button, Input, LoadingSpinner } from '@/components';
import { colors, spacing, typography } from '@/theme';

type Props = NativeStackScreenProps<DevicesStackParamList, 'DeviceRegistration'>;

const RegisterDeviceScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [provider, setProvider] = useState('manual');
  const [serial, setSerial] = useState('');
  const [adbHost, setAdbHost] = useState('127.0.0.1');
  const [adbPort, setAdbPort] = useState('5555');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const createMutation = useCreateDeviceMutation();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Device name is required';
    else if (name.length > 255) newErrors.name = 'Name must be 255 characters or less';
    if (!provider.trim()) newErrors.provider = 'Provider is required';
    if (adbPort && isNaN(Number(adbPort))) newErrors.adbPort = 'ADB port must be a number';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    try {
      await createMutation.mutateAsync({
        name: name.trim(),
        provider: provider.trim(),
        serial: serial.trim() || undefined,
        adbHost: adbHost.trim(),
        adbPort: adbPort ? Number(adbPort) : undefined,
      });
      Alert.alert('Success', 'Device registered successfully');
      navigation.goBack();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register device');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register Device</Text>
      <View style={styles.form}>
        <Input label="Device Name" value={name} onChangeText={setName} error={errors.name} />
        <Input
          label="Provider"
          value={provider}
          onChangeText={setProvider}
          error={errors.provider}
        />
        <Input label="Serial Number (optional)" value={serial} onChangeText={setSerial} />
        <Input label="ADB Host" value={adbHost} onChangeText={setAdbHost} />
        <Input
          label="ADB Port"
          value={adbPort}
          onChangeText={setAdbPort}
          error={errors.adbPort}
          keyboardType="numeric"
        />
        <Button
          title="Register Device"
          onPress={handleRegister}
          loading={createMutation.isPending}
          style={styles.button}
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
    ...typography.h1,
    color: colors.text,
    padding: spacing.lg,
  },
  form: {
    padding: spacing.lg,
  },
  button: {
    marginTop: spacing.lg,
  },
});

export default RegisterDeviceScreen;
