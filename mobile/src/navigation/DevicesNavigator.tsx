import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DevicesStackParamList } from '@/types';
import DevicesScreen from '@/screens/devices/DevicesScreen';
import DeviceDetailScreen from '@/screens/devices/DeviceDetailScreen';
import RegisterDeviceScreen from '@/screens/devices/RegisterDeviceScreen';
import DeviceAutoDiscoveryScreen from '@/screens/devices/DeviceAutoDiscoveryScreen';

const Stack = createNativeStackNavigator<DevicesStackParamList>();

const DevicesNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="DevicesList" component={DevicesScreen} options={{ title: 'Devices' }} />
      <Stack.Screen
        name="DeviceDetail"
        component={DeviceDetailScreen}
        options={{ title: 'Device Details' }}
      />
      <Stack.Screen
        name="DeviceRegistration"
        component={RegisterDeviceScreen}
        options={{ title: 'Register Device' }}
      />
      <Stack.Screen
        name="DeviceAutoDiscovery"
        component={DeviceAutoDiscoveryScreen}
        options={{ title: 'Discover Devices' }}
      />
    </Stack.Navigator>
  );
};

export default DevicesNavigator;
