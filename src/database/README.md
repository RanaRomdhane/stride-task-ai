
# MySQL Database Setup Guide

## Prerequisites
- MySQL 8.0 or higher
- Node.js application with MySQL2 driver

## Setup Instructions

### 1. Create Database
```sql
CREATE DATABASE taskmaster;
USE taskmaster;
```

### 2. Run Schema
Execute the `schema.sql` file in your MySQL database:
```bash
mysql -u your_username -p taskmaster < src/database/schema.sql
```

### 3. Configure Connection
Update the database configuration in `src/lib/mysql.ts`:

```typescript
const DB_CONFIG = {
  host: 'your-mysql-host',      // e.g., 'localhost' or '192.168.1.100'
  user: 'your-mysql-username',   // e.g., 'root' or 'taskmaster_user'
  password: 'your-mysql-password',
  database: 'taskmaster',        // or your preferred database name
  port: 3306,                    // default MySQL port
};
```

### 4. Test Connection
The application will automatically test the database connection on startup.

## Default Admin Account
- Email: `admin@taskmaster.com`
- Password: `admin123`

**Important:** Change the admin password after first login!

## Database Features
- ✅ User authentication with bcrypt password hashing
- ✅ Task management with full CRUD operations
- ✅ Project and batch management
- ✅ Comments and collaboration
- ✅ Notifications system
- ✅ User roles and permissions
- ✅ Sticky notes
- ✅ Indexes for optimal performance

## Security Notes
- Passwords are hashed with bcrypt
- SQL injection protection with parameterized queries
- Connection pooling for performance
- User sessions stored in localStorage

## Troubleshooting
1. **Connection Issues**: Check host, port, username, and password
2. **Permission Errors**: Ensure MySQL user has CREATE, INSERT, UPDATE, DELETE, SELECT permissions
3. **Port Issues**: Verify MySQL is running on the specified port
4. **Firewall**: Ensure MySQL port is accessible from your application server
