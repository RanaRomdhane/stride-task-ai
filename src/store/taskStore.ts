
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'inbox' | 'next-action' | 'waiting-for' | 'project' | 'someday-maybe' | 'completed';
  category: string;
  estimatedDuration: number; // in minutes
  deadline?: Date;
  dependencies: string[]; // task IDs
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  urgent: boolean;
  important: boolean;
  batchId?: string;
  pomodoroSessions: number;
  context: string; // location, tools needed, etc.
}

export interface TaskBatch {
  id: string;
  name: string;
  tasks: string[]; // task IDs
  totalDuration: number;
  context: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  scheduled?: Date;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  duration: number; // in minutes
  completed: boolean;
  startedAt: Date;
  completedAt?: Date;
}

interface TaskStore {
  tasks: Task[];
  batches: TaskBatch[];
  pomodoroSessions: PomodoroSession[];
  currentPomodoro?: PomodoroSession;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  completeTask: (id: string) => void;
  
  // Batch actions
  createBatch: (batch: Omit<TaskBatch, 'id' | 'createdAt'>) => void;
  updateBatch: (id: string, updates: Partial<TaskBatch>) => void;
  deleteBatch: (id: string) => void;
  addTaskToBatch: (taskId: string, batchId: string) => void;
  
  // Pomodoro actions
  startPomodoro: (taskId: string, duration?: number) => void;
  completePomodoro: () => void;
  pausePomodoro: () => void;
  
  // AI-powered actions
  batchSimilarTasks: () => void;
  suggestDependencies: (taskId: string) => string[];
  prioritizeTasks: () => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],
      batches: [],
      pomodoroSessions: [],
      
      addTask: (taskData) => {
        const task: Task = {
          ...taskData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
          updatedAt: new Date(),
          pomodoroSessions: 0,
        };
        
        set((state) => ({
          tasks: [...state.tasks, task],
        }));
        
        // Auto-suggest dependencies
        const suggestions = get().suggestDependencies(task.id);
        if (suggestions.length > 0) {
          get().updateTask(task.id, { dependencies: suggestions });
        }
        
        // Auto-batch similar tasks
        get().batchSimilarTasks();
      },
      
      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date() }
              : task
          ),
        }));
      },
      
      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          batches: state.batches.map((batch) => ({
            ...batch,
            tasks: batch.tasks.filter((taskId) => taskId !== id),
          })),
        }));
      },
      
      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  status: 'completed' as const,
                  completedAt: new Date(),
                  updatedAt: new Date(),
                }
              : task
          ),
        }));
      },
      
      createBatch: (batchData) => {
        const batch: TaskBatch = {
          ...batchData,
          id: crypto.randomUUID(),
          createdAt: new Date(),
        };
        
        set((state) => ({
          batches: [...state.batches, batch],
        }));
        
        // Update tasks with batch ID
        batch.tasks.forEach((taskId) => {
          get().updateTask(taskId, { batchId: batch.id });
        });
      },
      
      updateBatch: (id, updates) => {
        set((state) => ({
          batches: state.batches.map((batch) =>
            batch.id === id ? { ...batch, ...updates } : batch
          ),
        }));
      },
      
      deleteBatch: (id) => {
        // Remove batch ID from tasks
        const batch = get().batches.find((b) => b.id === id);
        if (batch) {
          batch.tasks.forEach((taskId) => {
            get().updateTask(taskId, { batchId: undefined });
          });
        }
        
        set((state) => ({
          batches: state.batches.filter((batch) => batch.id !== id),
        }));
      },
      
      addTaskToBatch: (taskId, batchId) => {
        get().updateTask(taskId, { batchId });
        get().updateBatch(batchId, {
          tasks: [...(get().batches.find((b) => b.id === batchId)?.tasks || []), taskId],
        });
      },
      
      startPomodoro: (taskId, duration = 25) => {
        const session: PomodoroSession = {
          id: crypto.randomUUID(),
          taskId,
          duration,
          completed: false,
          startedAt: new Date(),
        };
        
        set((state) => ({
          currentPomodoro: session,
        }));
      },
      
      completePomodoro: () => {
        const current = get().currentPomodoro;
        if (current) {
          const completedSession = {
            ...current,
            completed: true,
            completedAt: new Date(),
          };
          
          set((state) => ({
            pomodoroSessions: [...state.pomodoroSessions, completedSession],
            currentPomodoro: undefined,
          }));
          
          // Increment pomodoro count for task
          get().updateTask(current.taskId, {
            pomodoroSessions: get().tasks.find((t) => t.id === current.taskId)?.pomodoroSessions + 1 || 1,
          });
        }
      },
      
      pausePomodoro: () => {
        set({ currentPomodoro: undefined });
      },
      
      batchSimilarTasks: () => {
        const { tasks } = get();
        const unbatchedTasks = tasks.filter((task) => !task.batchId && task.status !== 'completed');
        
        // Group by context and category
        const groups: { [key: string]: Task[] } = {};
        
        unbatchedTasks.forEach((task) => {
          const key = `${task.context}-${task.category}`;
          if (!groups[key]) groups[key] = [];
          groups[key].push(task);
        });
        
        // Create batches for groups with 2+ tasks
        Object.entries(groups).forEach(([key, groupTasks]) => {
          if (groupTasks.length >= 2) {
            const totalDuration = groupTasks.reduce((sum, task) => sum + task.estimatedDuration, 0);
            const highestPriority = groupTasks.reduce((highest, task) => {
              const priorities = { low: 1, medium: 2, high: 3, urgent: 4 };
              return priorities[task.priority] > priorities[highest] ? task.priority : highest;
            }, 'low' as Task['priority']);
            
            get().createBatch({
              name: `${groupTasks[0].context} - ${groupTasks[0].category}`,
              tasks: groupTasks.map((t) => t.id),
              totalDuration,
              context: groupTasks[0].context,
              priority: highestPriority,
            });
          }
        });
      },
      
      suggestDependencies: (taskId) => {
        const { tasks } = get();
        const task = tasks.find((t) => t.id === taskId);
        if (!task) return [];
        
        const suggestions: string[] = [];
        
        // Rule-based dependency suggestions
        const dependencyRules: { [key: string]: string[] } = {
          'client meeting': ['prepare presentation', 'prepare agenda'],
          'project completion': ['create invoice', 'project review'],
          'contract': ['generate nda', 'legal review'],
          'presentation': ['gather materials', 'design slides'],
          'report': ['data collection', 'analysis'],
        };
        
        const taskLower = task.title.toLowerCase();
        Object.entries(dependencyRules).forEach(([trigger, deps]) => {
          if (taskLower.includes(trigger)) {
            deps.forEach((dep) => {
              const existingTask = tasks.find((t) => 
                t.title.toLowerCase().includes(dep) && t.id !== taskId
              );
              if (existingTask) {
                suggestions.push(existingTask.id);
              }
            });
          }
        });
        
        return suggestions;
      },
      
      prioritizeTasks: () => {
        const { tasks } = get();
        
        tasks.forEach((task) => {
          if (task.status === 'completed') return;
          
          // Calculate priority score
          let score = 0;
          
          // Deadline proximity (0-40 points)
          if (task.deadline) {
            const daysUntilDeadline = Math.ceil(
              (task.deadline.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );
            if (daysUntilDeadline <= 1) score += 40;
            else if (daysUntilDeadline <= 3) score += 30;
            else if (daysUntilDeadline <= 7) score += 20;
            else if (daysUntilDeadline <= 14) score += 10;
          }
          
          // Eisenhower Matrix (0-30 points)
          if (task.urgent && task.important) score += 30;
          else if (task.urgent) score += 20;
          else if (task.important) score += 15;
          
          // Dependencies (0-20 points)
          const dependentTasks = tasks.filter((t) => t.dependencies.includes(task.id));
          score += Math.min(dependentTasks.length * 5, 20);
          
          // Duration factor (0-10 points - shorter tasks get slight boost)
          if (task.estimatedDuration <= 15) score += 10;
          else if (task.estimatedDuration <= 30) score += 5;
          
          // Update priority based on score
          let newPriority: Task['priority'] = 'low';
          if (score >= 70) newPriority = 'urgent';
          else if (score >= 50) newPriority = 'high';
          else if (score >= 30) newPriority = 'medium';
          
          if (newPriority !== task.priority) {
            get().updateTask(task.id, { priority: newPriority });
          }
        });
      },
    }),
    {
      name: 'task-store',
    }
  )
);
