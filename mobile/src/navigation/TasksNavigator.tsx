import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TasksStackParamList } from '@/types';
import TasksScreen from '@/screens/tasks/TasksScreen';
import TaskDetailScreen from '@/screens/tasks/TaskDetailScreen';
import CreateTaskScreen from '@/screens/tasks/CreateTaskScreen';
import TaskAssignmentScreen from '@/screens/tasks/TaskAssignmentScreen';
import TaskResultScreen from '@/screens/tasks/TaskResultScreen';
import TaskHistoryScreen from '@/screens/tasks/TaskHistoryScreen';
import ScheduledTasksScreen from '@/screens/tasks/ScheduledTasksScreen';

const Stack = createNativeStackNavigator<TasksStackParamList>();

const TasksNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="TasksList" component={TasksScreen} options={{ title: 'Tasks' }} />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={{ title: 'Task Details' }}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{ title: 'Create Task' }}
      />
      <Stack.Screen
        name="TaskAssignment"
        component={TaskAssignmentScreen}
        options={{ title: 'Assign Task' }}
      />
      <Stack.Screen
        name="TaskResult"
        component={TaskResultScreen}
        options={{ title: 'Task Result' }}
      />
      <Stack.Screen
        name="TaskHistory"
        component={TaskHistoryScreen}
        options={{ title: 'Task History' }}
      />
      <Stack.Screen
        name="ScheduledTasks"
        component={ScheduledTasksScreen}
        options={{ title: 'Scheduled Tasks' }}
      />
    </Stack.Navigator>
  );
};

export default TasksNavigator;
