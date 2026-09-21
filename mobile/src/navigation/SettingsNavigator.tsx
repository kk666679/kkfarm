import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingsStackParamList } from '@/types';
import SettingsScreen from '@/screens/settings/SettingsScreen';
import SecuritySettingsScreen from '@/screens/settings/SecuritySettingsScreen';

const Stack = createNativeStackNavigator<SettingsStackParamList>();

const SettingsNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{ title: 'Security' }}
      />
    </Stack.Navigator>
  );
};

export default SettingsNavigator;
