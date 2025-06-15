import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'inbox' | 'next-action' | 'waiting-for' | 'project' | 'someday-maybe' | 'completed';
  category: string;
  estimated_duration: number; // in minutes
  deadline?: Date;
  dependencies: string[]; // task IDs
  tags: string[];
  created_at: Date;
  updated_at: Date;
  completed_at?: Date;
  urgent: boolean;
  important: boolean;
  batch_id?: string;
  pomodoro_sessions: number;
  context: string; // location, tools needed, etc.
  user_id: string;
  project_id?: string;
}

export interface TaskBatch {
  id: string;
  name: string;
  tasks: string[]; // task IDs
  total_duration: number;
  context: string;
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  scheduled?: Date;
  user_id: string;
}

export interface PomodoroSession {
  id: string;
  task_id: string;
  duration: number; // in minutes
  completed: boolean;
  started_at: Date;
  completed_at?: Date;
  user_id: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'sub_admin' | 'employee';
  department?: string;
  manager_id?: string;
  created_at: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  team_id?: string;
  manager_id: string;
  budget?: number;
  expenses?: number;
  status?: string;
  start_date?: Date;
  end_date?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface StickyNote {
  id: string;
  user_id: string;
  content: string;
  color?: string;
  position_x?: number;
  position_y?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Comment {
  id: string;
  user_id: string;
  task_id?: string;
  project_id?: string;
  parent_id?: string;
  content: string;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'task_update' | 'deadline_reminder' | 'comment' | 'assignment' | 'mention';
  title: string;
  message: string;
  entity_id?: string;
  entity_type?: 'task' | 'project' | 'comment';
  read: boolean;
  created_at: Date;
}

export interface NotificationSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  in_app_notifications: boolean;
  task_updates: boolean;
  deadline_reminders: boolean;
  comments: boolean;
  assignments: boolean;
  mentions: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TaskAssignment {
  id: string;
  task_id: string;
  user_id: string;
  assigned_by: string;
  role: 'owner' | 'assignee' | 'collaborator';
  created_at: Date;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  file_url?: string;
  file_name?: string;
  created_at: Date;
}

export interface MessageGroup {
  id: string;
  name: string;
  description?: string;
  created_by: string;
  project_id?: string;
  created_at: Date;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: 'admin' | 'member';
  joined_at: Date;
}

export interface Meeting {
  id: string;
  title: string;
  description?: string;
  start_time: Date;
  end_time: Date;
  location?: string;
  meeting_url?: string;
  created_by: string;
  project_id?: string;
  task_id?: string;
  created_at: Date;
  updated_at: Date;
}

export interface MeetingAttendee {
  id: string;
  meeting_id: string;
  user_id: string;
  status: 'invited' | 'accepted' | 'declined' | 'tentative';
  created_at: Date;
}

interface TaskStore {
  tasks: Task[];
  batches: TaskBatch[];
  pomodoroSessions: PomodoroSession[];
  currentPomodoro?: PomodoroSession;
  userRole?: UserRole;
  projects: Project[];
  stickyNotes: StickyNote[];
  comments: Comment[];
  notifications: Notification[];
  notificationSettings?: NotificationSettings;
  taskAssignments: TaskAssignment[];
  groupMessages: GroupMessage[];
  messageGroups: MessageGroup[];
  groupMembers: GroupMember[];
  meetings: Meeting[];
  meetingAttendees: MeetingAttendee[];
  loading: boolean;
  
  // Task actions
  fetchTasks: () => Promise<void>;
  addTask: (task: Omit<Task, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'pomodoro_sessions'>) => Promise<void>;
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  
  // Batch actions
  fetchBatches: () => Promise<void>;
  createBatch: (batch: Omit<TaskBatch, 'id' | 'created_at' | 'user_id'>) => Promise<void>;
  updateBatch: (id: string, updates: Partial<TaskBatch>) => Promise<void>;
  deleteBatch: (id: string) => Promise<void>;
  addTaskToBatch: (taskId: string, batchId: string) => Promise<void>;
  
  // Role and project actions
  fetchUserRole: () => Promise<void>;
  fetchProjects: () => Promise<void>;
  createProject: (project: Omit<Project, 'id' | 'created_at' | 'updated_at' | 'manager_id'>) => Promise<void>;
  
  // Sticky notes actions
  fetchStickyNotes: () => Promise<void>;
  createStickyNote: (note: Omit<StickyNote, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateStickyNote: (id: string, updates: Partial<StickyNote>) => Promise<void>;
  deleteStickyNote: (id: string) => Promise<void>;
  
  // Pomodoro actions
  startPomodoro: (taskId: string, duration?: number) => void;
  completePomodoro: () => Promise<void>;
  pausePomodoro: () => void;
  
  // Comment actions
  fetchComments: (taskId?: string, projectId?: string) => Promise<void>;
  createComment: (comment: Omit<Comment, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => Promise<void>;
  updateComment: (id: string, content: string) => Promise<void>;
  deleteComment: (id: string) => Promise<void>;
  
  // Notification actions
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  
  // Notification settings actions
  fetchNotificationSettings: () => Promise<void>;
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => Promise<void>;
  
  // Task assignment actions
  fetchTaskAssignments: (taskId?: string) => Promise<void>;
  assignUserToTask: (taskId: string, userId: string, role: TaskAssignment['role']) => Promise<void>;
  removeUserFromTask: (taskId: string, userId: string) => Promise<void>;
  
  // Group messaging actions
  fetchMessageGroups: () => Promise<void>;
  createMessageGroup: (group: Omit<MessageGroup, 'id' | 'created_at' | 'created_by'>) => Promise<void>;
  fetchGroupMessages: (groupId: string) => Promise<void>;
  sendGroupMessage: (groupId: string, content: string, fileUrl?: string, fileName?: string) => Promise<void>;
  
  // Meeting actions
  fetchMeetings: () => Promise<void>;
  createMeeting: (meeting: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => Promise<void>;
  updateMeeting: (id: string, updates: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  inviteToMeeting: (meetingId: string, userId: string) => Promise<void>;
  respondToMeetingInvite: (meetingId: string, status: MeetingAttendee['status']) => Promise<void>;
  
  // AI-powered actions
  batchSimilarTasks: () => Promise<void>;
  suggestDependencies: (taskId: string) => string[];
  prioritizeTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskStore>()((set, get) => ({
  tasks: [],
  batches: [],
  pomodoroSessions: [],
  projects: [],
  stickyNotes: [],
  comments: [],
  notifications: [],
  taskAssignments: [],
  groupMessages: [],
  messageGroups: [],
  groupMembers: [],
  meetings: [],
  meetingAttendees: [],
  loading: false,
  
  // Task actions
  fetchTasks: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const tasks = data?.map(task => ({
        ...task,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        completed_at: task.completed_at ? new Date(task.completed_at) : undefined,
        deadline: task.deadline ? new Date(task.deadline) : undefined,
      })) || [];

      set({ tasks });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
    } finally {
      set({ loading: false });
    }
  },

  addTask: async (taskData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert dates to ISO strings for database
      const dbData = {
        ...taskData,
        user_id: user.id,
        deadline: taskData.deadline?.toISOString(),
        completed_at: taskData.completed_at?.toISOString(),
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      const newTask: Task = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        completed_at: data.completed_at ? new Date(data.completed_at) : undefined,
        deadline: data.deadline ? new Date(data.deadline) : undefined,
      };

      set((state) => ({
        tasks: [newTask, ...state.tasks],
      }));

      // Auto-suggest dependencies
      const suggestions = get().suggestDependencies(newTask.id);
      if (suggestions.length > 0) {
        await get().updateTask(newTask.id, { dependencies: suggestions });
      }

      // Auto-batch similar tasks
      await get().batchSimilarTasks();
    } catch (error) {
      console.error('Error adding task:', error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  },

  updateTask: async (id, updates) => {
    try {
      // Convert dates to ISO strings for database, excluding updated_at
      const dbUpdates = {
        ...updates,
        deadline: updates.deadline?.toISOString(),
        completed_at: updates.completed_at?.toISOString(),
        created_at: updates.created_at?.toISOString(),
        updated_at: undefined, // Let the database handle this
      };

      const { error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, ...updates, updated_at: new Date() }
            : task
        ),
      }));
    } catch (error) {
      console.error('Error updating task:', error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  },

  deleteTask: async (id) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
        batches: state.batches.map((batch) => ({
          ...batch,
          tasks: batch.tasks.filter((taskId) => taskId !== id),
        })),
      }));
    } catch (error) {
      console.error('Error deleting task:', error);
      toast({
        title: "Error",
        description: "Failed to delete task",
        variant: "destructive",
      });
    }
  },

  completeTask: async (id) => {
    await get().updateTask(id, {
      status: 'completed' as const,
      completed_at: new Date(),
    });
  },

  // Batch actions
  fetchBatches: async () => {
    try {
      const { data, error } = await supabase
        .from('task_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const batches = data?.map(batch => ({
        ...batch,
        created_at: new Date(batch.created_at),
        scheduled: batch.scheduled ? new Date(batch.scheduled) : undefined,
      })) || [];

      set({ batches });
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  },

  createBatch: async (batchData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert dates to ISO strings for database
      const dbData = {
        ...batchData,
        user_id: user.id,
        scheduled: batchData.scheduled?.toISOString(),
      };

      const { data, error } = await supabase
        .from('task_batches')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      const newBatch: TaskBatch = {
        ...data,
        created_at: new Date(data.created_at),
        scheduled: data.scheduled ? new Date(data.scheduled) : undefined,
      };

      set((state) => ({
        batches: [newBatch, ...state.batches],
      }));

      // Update tasks with batch ID
      for (const taskId of batchData.tasks) {
        await get().updateTask(taskId, { batch_id: newBatch.id });
      }
    } catch (error) {
      console.error('Error creating batch:', error);
    }
  },

  updateBatch: async (id, updates) => {
    try {
      // Convert dates to ISO strings for database
      const dbUpdates = {
        ...updates,
        scheduled: updates.scheduled?.toISOString(),
        created_at: updates.created_at?.toISOString(),
      };

      const { error } = await supabase
        .from('task_batches')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        batches: state.batches.map((batch) =>
          batch.id === id ? { ...batch, ...updates } : batch
        ),
      }));
    } catch (error) {
      console.error('Error updating batch:', error);
    }
  },

  deleteBatch: async (id) => {
    try {
      // Remove batch ID from tasks
      const batch = get().batches.find((b) => b.id === id);
      if (batch) {
        for (const taskId of batch.tasks) {
          await get().updateTask(taskId, { batch_id: undefined });
        }
      }

      const { error } = await supabase
        .from('task_batches')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        batches: state.batches.filter((batch) => batch.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting batch:', error);
    }
  },

  addTaskToBatch: async (taskId, batchId) => {
    await get().updateTask(taskId, { batch_id: batchId });
    
    const batch = get().batches.find((b) => b.id === batchId);
    if (batch) {
      await get().updateBatch(batchId, {
        tasks: [...batch.tasks, taskId],
      });
    }
  },

  // Role and project actions
  fetchUserRole: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        set({
          userRole: {
            ...data,
            created_at: new Date(data.created_at),
          }
        });
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  },

  fetchProjects: async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projects = data?.map(project => ({
        ...project,
        created_at: new Date(project.created_at),
        updated_at: new Date(project.updated_at),
        start_date: project.start_date ? new Date(project.start_date) : undefined,
        end_date: project.end_date ? new Date(project.end_date) : undefined,
      })) || [];

      set({ projects });
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  },

  createProject: async (projectData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Convert dates to ISO strings for database
      const dbData = {
        ...projectData,
        manager_id: user.id,
        start_date: projectData.start_date?.toISOString(),
        end_date: projectData.end_date?.toISOString(),
      };

      const { data, error } = await supabase
        .from('projects')
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      const newProject: Project = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
        start_date: data.start_date ? new Date(data.start_date) : undefined,
        end_date: data.end_date ? new Date(data.end_date) : undefined,
      };

      set((state) => ({
        projects: [newProject, ...state.projects],
      }));
    } catch (error) {
      console.error('Error creating project:', error);
    }
  },

  // Sticky notes actions
  fetchStickyNotes: async () => {
    try {
      const { data, error } = await supabase
        .from('sticky_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const stickyNotes = data?.map(note => ({
        ...note,
        created_at: new Date(note.created_at),
        updated_at: new Date(note.updated_at),
      })) || [];

      set({ stickyNotes });
    } catch (error) {
      console.error('Error fetching sticky notes:', error);
    }
  },

  createStickyNote: async (noteData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('sticky_notes')
        .insert([{
          ...noteData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newNote: StickyNote = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      set((state) => ({
        stickyNotes: [newNote, ...state.stickyNotes],
      }));
    } catch (error) {
      console.error('Error creating sticky note:', error);
    }
  },

  updateStickyNote: async (id, updates) => {
    try {
      // Convert dates to ISO strings for database
      const dbUpdates = {
        ...updates,
        created_at: updates.created_at?.toISOString(),
        updated_at: updates.updated_at?.toISOString(),
      };

      const { error } = await supabase
        .from('sticky_notes')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        stickyNotes: state.stickyNotes.map((note) =>
          note.id === id ? { ...note, ...updates, updated_at: new Date() } : note
        ),
      }));
    } catch (error) {
      console.error('Error updating sticky note:', error);
    }
  },

  deleteStickyNote: async (id) => {
    try {
      const { error } = await supabase
        .from('sticky_notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        stickyNotes: state.stickyNotes.filter((note) => note.id !== id),
      }));
    } catch (error) {
      console.error('Error deleting sticky note:', error);
    }
  },

  // Pomodoro actions
  startPomodoro: (taskId, duration = 25) => {
    const session: PomodoroSession = {
      id: crypto.randomUUID(),
      task_id: taskId,
      duration,
      completed: false,
      started_at: new Date(),
      user_id: '', // Will be set when saving to DB
    };

    set({ currentPomodoro: session });
  },

  completePomodoro: async () => {
    const current = get().currentPomodoro;
    if (!current) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('pomodoro_sessions')
        .insert([{
          task_id: current.task_id,
          duration: current.duration,
          completed: true,
          started_at: current.started_at.toISOString(),
          completed_at: new Date().toISOString(),
          user_id: user.id,
        }]);

      if (error) throw error;

      set((state) => ({
        pomodoroSessions: [...state.pomodoroSessions, {
          ...current,
          completed: true,
          completed_at: new Date(),
          user_id: user.id,
        }],
        currentPomodoro: undefined,
      }));

      // Increment pomodoro count for task
      const task = get().tasks.find((t) => t.id === current.task_id);
      if (task) {
        await get().updateTask(current.task_id, {
          pomodoro_sessions: task.pomodoro_sessions + 1,
        });
      }
    } catch (error) {
      console.error('Error completing pomodoro:', error);
    }
  },

  pausePomodoro: () => {
    set({ currentPomodoro: undefined });
  },

  // Comment actions
  fetchComments: async (taskId, projectId) => {
    try {
      let query = supabase.from('comments').select('*').order('created_at', { ascending: true });
      
      if (taskId) {
        query = query.eq('task_id', taskId);
      } else if (projectId) {
        query = query.eq('project_id', projectId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const comments = data?.map(comment => ({
        ...comment,
        created_at: new Date(comment.created_at),
        updated_at: new Date(comment.updated_at),
      })) || [];
      
      set({ comments });
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast({
        title: "Error",
        description: "Failed to fetch comments",
        variant: "destructive",
      });
    }
  },

  createComment: async (commentData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert([{
          ...commentData,
          user_id: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newComment: Comment = {
        ...data,
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      set((state) => ({
        comments: [...state.comments, newComment],
      }));

      toast({
        title: "Success",
        description: "Comment added successfully",
      });
    } catch (error) {
      console.error('Error creating comment:', error);
      toast({
        title: "Error",
        description: "Failed to create comment",
        variant: "destructive",
      });
    }
  },

  updateComment: async (id, content) => {
    try {
      const { error } = await supabase
        .from('comments')
        .update({ content })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        comments: state.comments.map((comment) =>
          comment.id === id ? { ...comment, content, updated_at: new Date() } : comment
        ),
      }));

      toast({
        title: "Success",
        description: "Comment updated successfully",
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: "Error",
        description: "Failed to update comment",
        variant: "destructive",
      });
    }
  },

  deleteComment: async (id) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        comments: state.comments.filter((comment) => comment.id !== id),
      }));

      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment",
        variant: "destructive",
      });
    }
  },

  // Notification actions
  fetchNotifications: async () => {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifications = data?.map(notification => ({
        ...notification,
        created_at: new Date(notification.created_at),
      })) || [];

      set({ notifications });
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  },

  markNotificationAsRead: async (id) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((notification) =>
          notification.id === id ? { ...notification, read: true } : notification
        ),
      }));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      set((state) => ({
        notifications: state.notifications.map((notification) => ({
          ...notification,
          read: true,
        })),
      }));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  },

  // Notification settings actions
  fetchNotificationSettings: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        set({
          notificationSettings: {
            ...data,
            created_at: new Date(data.created_at),
            updated_at: new Date(data.updated_at),
          }
        });
      }
    } catch (error) {
      console.error('Error fetching notification settings:', error);
    }
  },

  updateNotificationSettings: async (settings) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: user.id,
          ...settings,
        })
        .select()
        .single();

      if (error) throw error;

      set({
        notificationSettings: {
          ...data,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.updated_at),
        }
      });

      toast({
        title: "Success",
        description: "Notification settings updated successfully",
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to update notification settings",
        variant: "destructive",
      });
    }
  },

  // Task assignment actions
  fetchTaskAssignments: async (taskId) => {
    try {
      let query = supabase.from('task_assignments').select('*');
      
      if (taskId) {
        query = query.eq('task_id', taskId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      const assignments = data?.map(assignment => ({
        ...assignment,
        created_at: new Date(assignment.created_at),
      })) || [];
      
      set({ taskAssignments: assignments });
    } catch (error) {
      console.error('Error fetching task assignments:', error);
    }
  },

  assignUserToTask: async (taskId, userId, role) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('task_assignments')
        .insert([{
          task_id: taskId,
          user_id: userId,
          assigned_by: user.id,
          role,
        }])
        .select()
        .single();

      if (error) throw error;

      const newAssignment: TaskAssignment = {
        ...data,
        created_at: new Date(data.created_at),
      };

      set((state) => ({
        taskAssignments: [...state.taskAssignments, newAssignment],
      }));

      toast({
        title: "Success",
        description: "User assigned to task successfully",
      });
    } catch (error) {
      console.error('Error assigning user to task:', error);
      toast({
        title: "Error",
        description: "Failed to assign user to task",
        variant: "destructive",
      });
    }
  },

  removeUserFromTask: async (taskId, userId) => {
    try {
      const { error } = await supabase
        .from('task_assignments')
        .delete()
        .eq('task_id', taskId)
        .eq('user_id', userId);

      if (error) throw error;

      set((state) => ({
        taskAssignments: state.taskAssignments.filter(
          (assignment) => !(assignment.task_id === taskId && assignment.user_id === userId)
        ),
      }));

      toast({
        title: "Success",
        description: "User removed from task successfully",
      });
    } catch (error) {
      console.error('Error removing user from task:', error);
      toast({
        title: "Error",
        description: "Failed to remove user from task",
        variant: "destructive",
      });
    }
  },

  // Group messaging actions
  fetchMessageGroups: async () => {
    try {
      const { data, error } = await supabase
        .from('message_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const groups = data?.map(group => ({
        ...group,
        created_at: new Date(group.created_at),
      })) || [];

      set({ messageGroups: groups });
    } catch (error) {
      console.error('Error fetching message groups:', error);
    }
  },

  createMessageGroup: async (groupData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('message_groups')
        .insert([{
          ...groupData,
          created_by: user.id,
        }])
        .select()
        .single();

      if (error) throw error;

      const newGroup: MessageGroup = {
        ...data,
        created_at: new Date(data.created_at),
      };

      set((state) => ({
        messageGroups: [newGroup, ...state.messageGroups],
      }));

      toast({
        title: "Success",
        description: "Message group created successfully",
      });
    } catch (error) {
      console.error('Error creating message group:', error);
      toast({
        title: "Error",
        description: "Failed to create message group",
        variant: "destructive",
      });
    }
  },

  fetchGroupMessages: async (groupId) => {
    try {
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const messages = data?.map(message => ({
        ...message,
        created_at: new Date(message.created_at),
      })) || [];

      set({ groupMessages: messages });
    } catch (error) {
      console.error('Error fetching group messages:', error);
    }
  },

  sendGroupMessage: async (groupId, content, fileUrl, fileName) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('group_messages')
        .insert([{
          group_id: groupId,
          sender_id: user.id,
          content,
          file_url: fileUrl,
          file_name: fileName,
        }])
        .select()
        .single();

      if (error) throw error;

      const newMessage: GroupMessage = {
        ...data,
        created_at: new Date(data.created_at),
      };

      set((state) => ({
        groupMessages: [...state.groupMessages, newMessage],
      }));
    } catch (error) {
      console.error('Error sending group message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  },

  // Meeting actions
  fetchMeetings: async () => {
    try {
      const { data, error } = await supabase
        .from('meetings')
        .select('*')
        .order('start_time', { ascending: true });

      if (error) throw error;

      const meetings = data?.map(meeting => ({
        ...meeting,
        start_time: new Date(meeting.start_time),
        end_time: new Date(meeting.end_time),
        created_at: new Date(meeting.created_at),
        updated_at: new Date(meeting.updated_at),
      })) || [];

      set({ meetings });
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  },

  createMeeting: async (meetingData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('meetings')
        .insert([{
          ...meetingData,
          created_by: user.id,
          start_time: meetingData.start_time.toISOString(),
          end_time: meetingData.end_time.toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      const newMeeting: Meeting = {
        ...data,
        start_time: new Date(data.start_time),
        end_time: new Date(data.end_time),
        created_at: new Date(data.created_at),
        updated_at: new Date(data.updated_at),
      };

      set((state) => ({
        meetings: [...state.meetings, newMeeting],
      }));

      toast({
        title: "Success",
        description: "Meeting created successfully",
      });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to create meeting",
        variant: "destructive",
      });
    }
  },

  updateMeeting: async (id, updates) => {
    try {
      const dbUpdates = {
        ...updates,
        start_time: updates.start_time?.toISOString(),
        end_time: updates.end_time?.toISOString(),
      };

      const { error } = await supabase
        .from('meetings')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        meetings: state.meetings.map((meeting) =>
          meeting.id === id ? { ...meeting, ...updates, updated_at: new Date() } : meeting
        ),
      }));

      toast({
        title: "Success",
        description: "Meeting updated successfully",
      });
    } catch (error) {
      console.error('Error updating meeting:', error);
      toast({
        title: "Error",
        description: "Failed to update meeting",
        variant: "destructive",
      });
    }
  },

  deleteMeeting: async (id) => {
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        meetings: state.meetings.filter((meeting) => meeting.id !== id),
      }));

      toast({
        title: "Success",
        description: "Meeting deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "Error",
        description: "Failed to delete meeting",
        variant: "destructive",
      });
    }
  },

  inviteToMeeting: async (meetingId, userId) => {
    try {
      const { data, error } = await supabase
        .from('meeting_attendees')
        .insert([{
          meeting_id: meetingId,
          user_id: userId,
          status: 'invited',
        }])
        .select()
        .single();

      if (error) throw error;

      const newAttendee: MeetingAttendee = {
        ...data,
        created_at: new Date(data.created_at),
      };

      set((state) => ({
        meetingAttendees: [...state.meetingAttendees, newAttendee],
      }));

      toast({
        title: "Success",
        description: "Meeting invitation sent successfully",
      });
    } catch (error) {
      console.error('Error inviting to meeting:', error);
      toast({
        title: "Error",
        description: "Failed to send meeting invitation",
        variant: "destructive",
      });
    }
  },

  respondToMeetingInvite: async (meetingId, status) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('meeting_attendees')
        .update({ status })
        .eq('meeting_id', meetingId)
        .eq('user_id', user.id);

      if (error) throw error;

      set((state) => ({
        meetingAttendees: state.meetings.map((attendee) =>
          attendee.meeting_id === meetingId && attendee.user_id === user.id
            ? { ...attendee, status }
            : attendee
        ),
      }));

      toast({
        title: "Success",
        description: "Meeting invitation response updated",
      });
    } catch (error) {
      console.error('Error responding to meeting invite:', error);
      toast({
        title: "Error",
        description: "Failed to respond to meeting invitation",
        variant: "destructive",
      });
    }
  },

  // AI-powered actions
  batchSimilarTasks: async () => {
    const { tasks } = get();
    const unbatchedTasks = tasks.filter((task) => !task.batch_id && task.status !== 'completed');

    // Group by context and category
    const groups: { [key: string]: Task[] } = {};

    unbatchedTasks.forEach((task) => {
      const key = `${task.context}-${task.category}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(task);
    });

    // Create batches for groups with 2+ tasks
    for (const [key, groupTasks] of Object.entries(groups)) {
      if (groupTasks.length >= 2) {
        const totalDuration = groupTasks.reduce((sum, task) => sum + task.estimated_duration, 0);
        const highestPriority = groupTasks.reduce((highest, task) => {
          const priorities = { low: 1, medium: 2, high: 3, urgent: 4 };
          return priorities[task.priority] > priorities[highest] ? task.priority : highest;
        }, 'low' as Task['priority']);

        // Only use 'low', 'medium', 'high' for batch priority
        const batchPriority = highestPriority === 'urgent' ? 'high' : highestPriority;

        await get().createBatch({
          name: `${groupTasks[0].context} - ${groupTasks[0].category}`,
          tasks: groupTasks.map((t) => t.id),
          total_duration: totalDuration,
          context: groupTasks[0].context,
          priority: batchPriority,
        });
      }
    }
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

  prioritizeTasks: async () => {
    const { tasks } = get();

    for (const task of tasks) {
      if (task.status === 'completed') continue;

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
      if (task.estimated_duration <= 15) score += 10;
      else if (task.estimated_duration <= 30) score += 5;

      // Update priority based on score
      let newPriority: Task['priority'] = 'low';
      if (score >= 70) newPriority = 'urgent';
      else if (score >= 50) newPriority = 'high';
      else if (score >= 30) newPriority = 'medium';

      if (newPriority !== task.priority) {
        await get().updateTask(task.id, { priority: newPriority });
      }
    }
  },
}));
