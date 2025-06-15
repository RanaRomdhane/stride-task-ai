
// Mock database service using localStorage to simulate MySQL operations
class MockDbService {
  private getStorageKey(table: string): string {
    return `taskmaster_${table}`;
  }

  private getNextId(table: string): string {
    const items = this.query(`SELECT id FROM ${table}`, []);
    const maxId = items.reduce((max, item) => {
      const numId = parseInt(item.id.split('-')[0]) || 0;
      return Math.max(max, numId);
    }, 0);
    return `${maxId + 1}-${crypto.randomUUID()}`;
  }

  // Simulate SQL query operations
  query(sql: string, params: any[] = []): any[] {
    console.log('Mock DB Query:', sql, params);
    
    // Parse basic SQL operations
    const sqlLower = sql.toLowerCase().trim();
    
    if (sqlLower.startsWith('select')) {
      return this.handleSelect(sql, params);
    } else if (sqlLower.startsWith('insert')) {
      return this.handleInsert(sql, params);
    } else if (sqlLower.startsWith('update')) {
      return this.handleUpdate(sql, params);
    } else if (sqlLower.startsWith('delete')) {
      return this.handleDelete(sql, params);
    }
    
    return [];
  }

  private handleSelect(sql: string, params: any[]): any[] {
    if (sql.includes('FROM users')) {
      const users = JSON.parse(localStorage.getItem(this.getStorageKey('users')) || '[]');
      
      if (sql.includes('WHERE email = ?')) {
        return users.filter((user: any) => user.email === params[0]);
      } else if (sql.includes('WHERE id = ?')) {
        return users.filter((user: any) => user.id === params[0]);
      }
      
      return users;
    } else if (sql.includes('FROM tasks')) {
      const tasks = JSON.parse(localStorage.getItem(this.getStorageKey('tasks')) || '[]');
      
      if (sql.includes('WHERE user_id = ?')) {
        return tasks.filter((task: any) => task.user_id === params[0]);
      } else if (sql.includes('WHERE id = ?')) {
        return tasks.filter((task: any) => task.id === params[0]);
      }
      
      return tasks;
    }
    
    return [];
  }

  private handleInsert(sql: string, params: any[]): { insertId: string } {
    if (sql.includes('INSERT INTO users')) {
      const users = JSON.parse(localStorage.getItem(this.getStorageKey('users')) || '[]');
      const newUser = {
        id: params[0],
        email: params[1],
        password_hash: params[2],
        full_name: params[3],
        created_at: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(this.getStorageKey('users'), JSON.stringify(users));
      return { insertId: params[0] };
    } else if (sql.includes('INSERT INTO tasks')) {
      const tasks = JSON.parse(localStorage.getItem(this.getStorageKey('tasks')) || '[]');
      const newTask = {
        id: params[0],
        title: params[1],
        description: params[2],
        status: params[3],
        priority: params[4],
        estimated_duration: params[5],
        deadline: params[6],
        user_id: params[7],
        tags: params[8],
        urgent: params[9],
        important: params[10],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        completed_at: null,
        pomodoro_sessions: 0
      };
      tasks.push(newTask);
      localStorage.setItem(this.getStorageKey('tasks'), JSON.stringify(tasks));
      return { insertId: params[0] };
    }
    
    return { insertId: '' };
  }

  private handleUpdate(sql: string, params: any[]): { affectedRows: number } {
    if (sql.includes('UPDATE tasks')) {
      const tasks = JSON.parse(localStorage.getItem(this.getStorageKey('tasks')) || '[]');
      const taskId = params[params.length - 1]; // Last parameter is the ID
      const taskIndex = tasks.findIndex((task: any) => task.id === taskId);
      
      if (taskIndex !== -1) {
        // Parse SET clause and update fields
        const setClause = sql.match(/SET\s+(.*?)\s+WHERE/i)?.[1] || '';
        const setFields = setClause.split(',').map(f => f.trim());
        
        let paramIndex = 0;
        setFields.forEach(field => {
          if (field.includes('title = ?')) tasks[taskIndex].title = params[paramIndex++];
          if (field.includes('description = ?')) tasks[taskIndex].description = params[paramIndex++];
          if (field.includes('status = ?')) tasks[taskIndex].status = params[paramIndex++];
          if (field.includes('priority = ?')) tasks[taskIndex].priority = params[paramIndex++];
          if (field.includes('estimated_duration = ?')) tasks[taskIndex].estimated_duration = params[paramIndex++];
          if (field.includes('deadline = ?')) tasks[taskIndex].deadline = params[paramIndex++];
          if (field.includes('tags = ?')) tasks[taskIndex].tags = params[paramIndex++];
          if (field.includes('completed_at = ?')) tasks[taskIndex].completed_at = params[paramIndex++];
          if (field.includes('pomodoro_sessions = ?')) tasks[taskIndex].pomodoro_sessions = params[paramIndex++];
          if (field.includes('updated_at = NOW()')) tasks[taskIndex].updated_at = new Date().toISOString();
        });
        
        localStorage.setItem(this.getStorageKey('tasks'), JSON.stringify(tasks));
        return { affectedRows: 1 };
      }
    }
    
    return { affectedRows: 0 };
  }

  private handleDelete(sql: string, params: any[]): { affectedRows: number } {
    if (sql.includes('DELETE FROM tasks')) {
      const tasks = JSON.parse(localStorage.getItem(this.getStorageKey('tasks')) || '[]');
      const taskId = params[0];
      const filteredTasks = tasks.filter((task: any) => task.id !== taskId);
      const affectedRows = tasks.length - filteredTasks.length;
      localStorage.setItem(this.getStorageKey('tasks'), JSON.stringify(filteredTasks));
      return { affectedRows };
    }
    
    return { affectedRows: 0 };
  }

  // Helper methods for compatibility
  async findOne(sql: string, params: any[] = []): Promise<any> {
    const rows = this.query(sql, params);
    return rows[0] || null;
  }

  async insert(sql: string, params: any[] = []): Promise<string> {
    const result = this.handleInsert(sql, params);
    return result.insertId;
  }

  async execute(sql: string, params: any[] = []): Promise<number> {
    if (sql.toLowerCase().includes('update')) {
      const result = this.handleUpdate(sql, params);
      return result.affectedRows;
    } else if (sql.toLowerCase().includes('delete')) {
      const result = this.handleDelete(sql, params);
      return result.affectedRows;
    }
    return 0;
  }
}

export const mockDb = new MockDbService();

// Test connection mock
export const testConnection = async (): Promise<boolean> => {
  console.log('✅ Mock database connected successfully');
  return true;
};
