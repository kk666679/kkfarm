import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

// Root Navigator
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

export type RootStackNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;

// Main Bottom Tabs
export type MainTabParamList = {
  DashboardTab: undefined;
  DevicesTab: undefined;
  TasksTab: undefined;
  FarmTab: undefined;
  SettingsTab: undefined;
};

export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;

// Dashboard Stack
export type DashboardStackParamList = {
  Dashboard: undefined;
};

export type DashboardStackNavigationProp = NativeStackNavigationProp<DashboardStackParamList>;

// Device Stack
export type DevicesStackParamList = {
  DevicesList: undefined;
  DeviceDetail: { deviceId: string };
  DeviceRegistration: undefined;
  DeviceAutoDiscovery: undefined;
  RegisterDevice: undefined;
};

export type DevicesStackNavigationProp = NativeStackNavigationProp<DevicesStackParamList>;
export type DeviceDetailRouteProp = RouteProp<DevicesStackParamList, 'DeviceDetail'>;

// Task Stack
export type TasksStackParamList = {
  TasksList: undefined;
  TaskDetail: { taskId: string };
  CreateTask: undefined;
  TaskAssignment: { taskId: string };
  TaskResult: { taskId: string };
  TaskHistory: undefined;
  ScheduledTasks: undefined;
};

export type TasksStackNavigationProp = NativeStackNavigationProp<TasksStackParamList>;
export type TaskDetailRouteProp = RouteProp<TasksStackParamList, 'TaskDetail'>;
export type TaskAssignmentRouteProp = RouteProp<TasksStackParamList, 'TaskAssignment'>;
export type TaskResultRouteProp = RouteProp<TasksStackParamList, 'TaskResult'>;

// Farm Stack
export type FarmStackParamList = {
  FarmOverview: undefined;
  Metrics: undefined;
  Logs: undefined;
  AIChat: undefined;
};

export type FarmStackNavigationProp = NativeStackNavigationProp<FarmStackParamList>;

// Settings Stack
export type SettingsStackParamList = {
  SettingsMain: undefined;
  SecuritySettings: undefined;
};

export type SettingsStackNavigationProp = NativeStackNavigationProp<SettingsStackParamList>;
