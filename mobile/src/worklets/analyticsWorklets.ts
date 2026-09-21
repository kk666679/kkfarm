import { runOnUI } from 'react-native-worklets';

export const aggregateTaskAnalytics = (tasks: any[]): any => {
  'worklet';
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const failed = tasks.filter(t => t.status === 'failed').length;
  const successRate = total > 0 ? (completed / total) * 100 : 0;
  const byType: Record<string, number> = {};
  tasks.forEach(task => {
    byType[task.type] = (byType[task.type] || 0) + 1;
  });
  return { total, completed, failed, successRate, byType };
};

export const calculateAverageExecutionTime = (tasks: any[]): number => {
  'worklet';
  const completedTasks = tasks.filter(t => t.status === 'completed' && t.executionTime);
  if (completedTasks.length === 0) return 0;
  const total = completedTasks.reduce((sum, t) => sum + t.executionTime, 0);
  return total / completedTasks.length;
};

export default {
  aggregateTaskAnalytics,
  calculateAverageExecutionTime,
};
