import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { FarmStackParamList } from '@/types';
import FarmScreen from '@/screens/farm/FarmScreen';
import MetricsScreen from '@/screens/farm/MetricsScreen';
import LogsScreen from '@/screens/farm/LogsScreen';
import AIChatScreen from '@/screens/farm/AIChatScreen';

const Stack = createNativeStackNavigator<FarmStackParamList>();

const FarmNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="FarmOverview"
        component={FarmScreen}
        options={{ title: 'Farm Control' }}
      />
      <Stack.Screen name="Metrics" component={MetricsScreen} options={{ title: 'Metrics' }} />
      <Stack.Screen name="Logs" component={LogsScreen} options={{ title: 'System Logs' }} />
      <Stack.Screen name="AIChat" component={AIChatScreen} options={{ title: 'AI Assistant' }} />
    </Stack.Navigator>
  );
};

export default FarmNavigator;
