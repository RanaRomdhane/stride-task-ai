
import { create } from 'zustand';
import { authService, User } from '@/services/authService';
import { taskService, Task } from '@/services/taskService';
import { testConnection } from '@/lib/mysql';

interface TaskStore {
  // State
  user: User | null;
  tasks: Task[];
  loading: boolean;
  connected: boolean;

  // Auth actions
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  initializeAuth: () => void;

  // Task actions
  fetchTasks: () => Promise<void>;
  createTask: (task: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string) => Promise<void>;
  
  // Database
  testDatabaseConnection: () => Promise<boolean>;
}

export const useTaskStore = create<TaskStore>((set, get) => ({
  // Initial state
  user: null,
  tasks: [],
  loading: false,
  connected: false,

  // Initialize authentication
  initializeAuth: () => {
    const user = authService.getCurrentUser();
    set({ user });
    
    // Test database connection
    get().testDatabaseConnection();
    
    // Fetch tasks if user is logged in
    if (user) {
      get().fetchTasks();
    }
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    set({ loading: true });
    try {
      const { user, error } = await authService.signIn(email, password);
      if (user) {
        set({ user });
        await get().fetchTasks();
      }
      return { error };
    } finally {
      set({ loading: false });
    }
  },

  // Sign up
  signUp: async (email: string, password: string, fullName: string) => {
    set({ loading: true });
    try {
      const { user, error } = await authService.signUp(email, password, fullName);
      if (user) {
        set({ user });
      }
      return { error };
    } finally {
      set({ loading: false });
    }
  },

  // Sign out
  signOut: async () => {
    await authService.signOut();
    set({ user: null, tasks: [] });
  },

  // Test database connection
  testDatabaseConnection: async () => {
    const connected = await testConnection();
    set({ connected });
    return connected;
  },

  // Fetch tasks
  fetchTasks: async () => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });
    try {
      const tasks = await taskService.getTasks(user.id);
      set({ tasks });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Create task
  createTask: async (task: Partial<Task>) => {
    const { user } = get();
    if (!user) return;

    set({ loading: true });
    try {
      const taskId = await taskService.createTask(task, user.id);
      if (taskId) {
        await get().fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Update task
  updateTask: async (taskId: string, updates: Partial<Task>) => {
    set({ loading: true });
    try {
      const success = await taskService.updateTask(taskId, updates);
      if (success) {
        await get().fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Delete task
  deleteTask: async (taskId: string) => {
    set({ loading: true });
    try {
      const success = await taskService.deleteTask(taskId);
      if (success) {
        await get().fetchTasks(); // Refresh tasks
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    } finally {
      set({ loading: false });
    }
  },

  // Complete task
  completeTask: async (taskId: string) => {
    await get().updateTask(taskId, {
      status: 'completed',
      completed_at: new Date()
    });
  },
}));
