
-- TaskMaster MySQL Database Schema
-- Run this SQL in your MySQL database to create the required tables

-- Create database (run this first)
-- CREATE DATABASE taskmaster;
-- USE taskmaster;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    status ENUM('inbox', 'next-action', 'waiting-for', 'project', 'someday-maybe', 'completed') DEFAULT 'inbox',
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    estimated_duration INT DEFAULT 30,
    deadline DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    user_id VARCHAR(36) NOT NULL,
    tags JSON,
    pomodoro_sessions INT DEFAULT 0,
    urgent BOOLEAN DEFAULT FALSE,
    important BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_priority (priority),
    INDEX idx_deadline (deadline)
);

-- Task batches table
CREATE TABLE IF NOT EXISTS task_batches (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    context TEXT,
    priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
    total_duration INT DEFAULT 0,
    scheduled DATETIME NULL,
    user_id VARCHAR(36) NOT NULL,
    tasks JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- User roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    role ENUM('admin', 'sub_admin', 'employee') DEFAULT 'employee',
    department VARCHAR(255),
    manager_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_role (user_id, role)
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    manager_id VARCHAR(36) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    budget DECIMAL(10,2),
    expenses DECIMAL(10,2) DEFAULT 0,
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Sticky notes table
CREATE TABLE IF NOT EXISTS sticky_notes (
    id VARCHAR(36) PRIMARY KEY,
    content TEXT NOT NULL,
    color VARCHAR(20) DEFAULT 'yellow',
    position_x INT DEFAULT 0,
    position_y INT DEFAULT 0,
    user_id VARCHAR(36) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(36) PRIMARY KEY,
    content TEXT NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    task_id VARCHAR(36),
    project_id VARCHAR(36),
    parent_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    read_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user (password: admin123)
INSERT IGNORE INTO users (id, email, password_hash, full_name) VALUES 
('admin-uuid', 'admin@taskmaster.com', '$2a$10$8K1p/a0dFwqt8QI6ZVCEb.ZJ4n8oP3YD5N7X/UkVJaOgzFSLy3pRa', 'System Administrator');

-- Insert admin role
INSERT IGNORE INTO user_roles (id, user_id, role) VALUES 
('admin-role-uuid', 'admin-uuid', 'admin');
