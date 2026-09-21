import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '@/types';
import { colors } from '@/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DashboardNavigator from './DashboardNavigator';
import DevicesNavigator from './DevicesNavigator';
import TasksNavigator from './TasksNavigator';
import FarmNavigator from './FarmNavigator';
import SettingsNavigator from './SettingsNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const BottomTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Icon name="view-dashboard" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="DevicesTab"
        component={DevicesNavigator}
        options={{
          tabBarLabel: 'Devices',
          tabBarIcon: ({ color, size }) => <Icon name="cellphone" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="TasksTab"
        component={TasksNavigator}
        options={{
          tabBarLabel: 'Tasks',
          tabBarIcon: ({ color, size }) => <Icon name="clipboard-list" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="FarmTab"
        component={FarmNavigator}
        options={{
          tabBarLabel: 'Farm',
          tabBarIcon: ({ color, size }) => <Icon name="server" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Icon name="cog" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;
