import { useEffect, useRef, useState } from 'react';
import { Task } from '@/types';

export function useTaskQueue() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const queueRef = useRef<Task[]>([]);

  useEffect(() => {
    queueRef.current = tasks;
  }, [tasks]);

  const enqueue = (task: Task) => {
    setTasks(prev => [...prev, task]);
  };

  const dequeue = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => (t.id === taskId ? { ...t, ...updates } : t)));
  };

  const clear = () => {
    setTasks([]);
  };

  return {
    tasks,
    isProcessing,
    enqueue,
    dequeue,
    updateTask,
    clear,
    queueSize: queueRef.current.length,
  };
}
