
import mysql from 'mysql2/promise';

// Database configuration - Update these with your MySQL credentials
const DB_CONFIG = {
  host: 'localhost', // Change to your MySQL host
  user: 'root', // Change to your MySQL username
  password: '', // Change to your MySQL password
  database: 'taskmaster', // Change to your database name
  port: 3306, // Change if using different port
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Create connection pool
const pool = mysql.createPool(DB_CONFIG);

// Database connection helper
export const db = {
  // Execute query with parameters
  async query(sql: string, params: any[] = []) {
    try {
      const [rows] = await pool.execute(sql, params);
      return rows;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  },

  // Get single record
  async findOne(sql: string, params: any[] = []) {
    const rows = await this.query(sql, params) as any[];
    return rows[0] || null;
  },

  // Insert record and return ID
  async insert(sql: string, params: any[] = []) {
    const result = await this.query(sql, params) as any;
    return result.insertId;
  },

  // Update/Delete operations
  async execute(sql: string, params: any[] = []) {
    const result = await this.query(sql, params) as any;
    return result.affectedRows;
  }
};

// Test connection
export const testConnection = async () => {
  try {
    await pool.getConnection();
    console.log('✅ MySQL connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
};
