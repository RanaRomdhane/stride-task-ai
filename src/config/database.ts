
// Database configuration - switch between mock and real database
export const dbConfig = {
  // Set to 'mock' for browser testing, 'mysql' for real backend
  mode: 'mock' as 'mock' | 'mysql',
  
  // MySQL connection settings (for local development)
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'taskmaster',
  },

  // API endpoints for backend integration
  api: {
    baseUrl: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001'  // NestJS default
      : '',
    endpoints: {
      auth: '/api/auth',
      tasks: '/api/tasks',
      users: '/api/users',
    }
  }
};

// Helper to check if we're using mock database
export const isMockMode = () => dbConfig.mode === 'mock';

// Helper to get API URL
export const getApiUrl = (endpoint: string) => 
  `${dbConfig.api.baseUrl}${endpoint}`;
