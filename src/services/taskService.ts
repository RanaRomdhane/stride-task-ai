
import { db } from '@/lib/mysql';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'inbox' | 'next-action' | 'waiting-for' | 'project' | 'someday-maybe' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimated_duration: number;
  deadline: Date | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
  user_id: string;
  tags: string[];
  pomodoro_sessions: number;
  urgent: boolean;
  important: boolean;
}

class TaskService {
  // Get all tasks for user
  async getTasks(userId: string): Promise<Task[]> {
    try {
      const tasks = await db.query(
        `SELECT id, title, description, status, priority, estimated_duration, 
         deadline, created_at, updated_at, completed_at, user_id, 
         tags, pomodoro_sessions, urgent, important 
         FROM tasks WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      ) as any[];

      return tasks.map(task => ({
        ...task,
        tags: task.tags ? JSON.parse(task.tags) : [],
        deadline: task.deadline ? new Date(task.deadline) : null,
        created_at: new Date(task.created_at),
        updated_at: new Date(task.updated_at),
        completed_at: task.completed_at ? new Date(task.completed_at) : null
      }));
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Create new task
  async createTask(task: Partial<Task>, userId: string): Promise<string | null> {
    try {
      const taskId = crypto.randomUUID();
      await db.insert(
        `INSERT INTO tasks (id, title, description, status, priority, 
         estimated_duration, deadline, user_id, tags, urgent, important, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          taskId,
          task.title || '',
          task.description || '',
          task.status || 'inbox',
          task.priority || 'medium',
          task.estimated_duration || 30,
          task.deadline || null,
          userId,
          JSON.stringify(task.tags || []),
          task.urgent || false,
          task.important || false
        ]
      );
      return taskId;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  // Update task
  async updateTask(taskId: string, updates: Partial<Task>): Promise<boolean> {
    try {
      const setClause = [];
      const values = [];

      if (updates.title !== undefined) { setClause.push('title = ?'); values.push(updates.title); }
      if (updates.description !== undefined) { setClause.push('description = ?'); values.push(updates.description); }
      if (updates.status !== undefined) { setClause.push('status = ?'); values.push(updates.status); }
      if (updates.priority !== undefined) { setClause.push('priority = ?'); values.push(updates.priority); }
      if (updates.estimated_duration !== undefined) { setClause.push('estimated_duration = ?'); values.push(updates.estimated_duration); }
      if (updates.deadline !== undefined) { setClause.push('deadline = ?'); values.push(updates.deadline); }
      if (updates.tags !== undefined) { setClause.push('tags = ?'); values.push(JSON.stringify(updates.tags)); }
      if (updates.completed_at !== undefined) { setClause.push('completed_at = ?'); values.push(updates.completed_at); }
      if (updates.pomodoro_sessions !== undefined) { setClause.push('pomodoro_sessions = ?'); values.push(updates.pomodoro_sessions); }

      setClause.push('updated_at = NOW()');
      values.push(taskId);

      await db.execute(
        `UPDATE tasks SET ${setClause.join(', ')} WHERE id = ?`,
        values
      );
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }

  // Delete task
  async deleteTask(taskId: string): Promise<boolean> {
    try {
      await db.execute('DELETE FROM tasks WHERE id = ?', [taskId]);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Complete task
  async completeTask(taskId: string): Promise<boolean> {
    return this.updateTask(taskId, {
      status: 'completed',
      completed_at: new Date()
    });
  }
}

export const taskService = new TaskService();
