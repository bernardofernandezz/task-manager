import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Task, Category } from '@/types';

interface TaskStore {
  tasks: Task[];
  categories: Category[];
  searchQuery: string;
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
  addCategory: (category: Category) => void;
  deleteCategory: (categoryId: string) => void;
  setSearchQuery: (query: string) => void;
  getFilteredTasks: () => Task[];
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      categories: [],
      searchQuery: '',
      setTasks: (tasks) => set({ tasks }),
      addTask: (task) => set((state) => ({ tasks: [task, ...state.tasks] })),
      updateTask: (taskId, updates) =>
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updates } : task
          ),
        })),
      deleteTask: (taskId) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== taskId),
        })),
      addCategory: (category) =>
        set((state) => ({
          categories: [...state.categories, category],
        })),
      deleteCategory: (categoryId) =>
        set((state) => ({
          categories: state.categories.filter((cat) => cat.id !== categoryId),
          tasks: state.tasks.map((task) =>
            task.categoryId === categoryId ? { ...task, categoryId: undefined } : task
          ),
        })),
      setSearchQuery: (query) => set({ searchQuery: query }),
      getFilteredTasks: () => {
        const state = get();
        const searchLower = state.searchQuery.toLowerCase();
        return state.tasks.filter((task) =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description?.toLowerCase().includes(searchLower)
        );
      },
    }),
    {
      name: 'task-storage',
    }
  )
);