
// Browser-compatible database service using localStorage
import { mockDb, testConnection as mockTestConnection } from '@/services/mockDbService';

// Use mock database for browser compatibility
export const db = {
  // Execute query with parameters
  async query(sql: string, params: any[] = []) {
    try {
      return mockDb.query(sql, params);
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  // Get single record
  async findOne(sql: string, params: any[] = []) {
    return mockDb.findOne(sql, params);
  },

  // Insert record and return ID
  async insert(sql: string, params: any[] = []) {
    return mockDb.insert(sql, params);
  },

  // Update/Delete operations
  async execute(sql: string, params: any[] = []) {
    return mockDb.execute(sql, params);
  }
};

// Test connection
export const testConnection = async () => {
  return mockTestConnection();
};
