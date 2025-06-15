
# Backend Integration Guide

This codebase is prepared for easy integration with NestJS or StackJS backends.

## Current Structure

### Services Layer
- `src/services/authService.ts` - Authentication logic using mock database
- `src/services/taskService.ts` - Task management using mock database  
- `src/services/mockDbService.ts` - Browser-compatible mock database
- `src/services/apiService.ts` - API layer ready for real backend

### Configuration
- `src/config/database.ts` - Database and API configuration
- `src/lib/mysql.ts` - Database abstraction layer

## Integration Steps

### 1. Set up your NestJS backend
```bash
# Create new NestJS project
npm i -g @nestjs/cli
nest new taskmaster-backend
cd taskmaster-backend

# Install MySQL dependencies
npm install @nestjs/typeorm typeorm mysql2
npm install @nestjs/jwt @nestjs/passport passport passport-jwt
```

### 2. Update API configuration
In `src/config/database.ts`, change:
```typescript
mode: 'mysql' // Change from 'mock' to 'mysql'
```

### 3. Replace mock services with API calls
In `src/services/apiService.ts`, uncomment the real API implementation and remove mock code.

### 4. Environment variables
Create `.env.local` in your React app:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=taskmaster
```

### 5. Backend API Endpoints to Implement

#### Authentication
- `POST /api/auth/signin` - User login
- `POST /api/auth/signup` - User registration  
- `POST /api/auth/signout` - User logout

#### Tasks
- `GET /api/tasks?userId=:id` - Get user tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

#### Users (Admin)
- `GET /api/users` - Get all users
- `PUT /api/users/:id/role` - Update user role

## Database Schema

The current mock database structure matches this MySQL schema:

```sql
CREATE TABLE users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('inbox', 'next-action', 'waiting-for', 'project', 'someday-maybe', 'completed') DEFAULT 'inbox',
  priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
  estimated_duration INT DEFAULT 30,
  deadline DATETIME NULL,
  user_id VARCHAR(36) NOT NULL,
  tags JSON,
  urgent BOOLEAN DEFAULT FALSE,
  important BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  completed_at TIMESTAMP NULL,
  pomodoro_sessions INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## Testing

The current setup works entirely in the browser with localStorage. When you're ready to integrate:

1. Start your NestJS backend
2. Update the configuration
3. Test the API endpoints
4. Replace mock services gradually

## Migration Path

1. ✅ Frontend works with mock database (current state)
2. 🔄 Set up NestJS backend with MySQL
3. 🔄 Implement API endpoints
4. 🔄 Switch frontend to use real API
5. 🔄 Deploy both frontend and backend

The code is structured to make this transition smooth and gradual.
