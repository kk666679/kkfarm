import { useEffect, useState } from 'react';
import { Task, TaskStatus } from '@/types';

export function useTaskFilters() {
  const [statusFilters, setStatusFilters] = useState<TaskStatus[]>([]);
  const [typeFilters, setTypeFilters] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  const toggleStatusFilter = (status: TaskStatus) => {
    setStatusFilters(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const toggleTypeFilter = (type: string) => {
    setTypeFilters(prev => (prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]));
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setTypeFilters([]);
    setSearchText('');
  };

  const filterTasks = (tasks: Task[]): Task[] => {
    return tasks.filter(task => {
      if (statusFilters.length > 0 && !statusFilters.includes(task.status)) {
        return false;
      }
      if (typeFilters.length > 0 && !typeFilters.includes(task.type)) {
        return false;
      }
      if (searchText && !task.name.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }
      return true;
    });
  };

  return {
    statusFilters,
    typeFilters,
    searchText,
    toggleStatusFilter,
    toggleTypeFilter,
    setSearchText,
    clearFilters,
    filterTasks,
  };
}
