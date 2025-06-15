
import { db } from '@/lib/mysql';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AuthResponse {
  user: User | null;
  error: string | null;
}

class AuthService {
  // Sign up new user
  async signUp(email: string, password: string, fullName: string): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db.findOne(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );

      if (existingUser) {
        return { user: null, error: 'User already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);
      const userId = crypto.randomUUID();

      // Insert user
      await db.insert(
        'INSERT INTO users (id, email, password_hash, full_name, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, email, hashedPassword, fullName]
      );

      // Get created user
      const user = await db.findOne(
        'SELECT id, email, full_name, created_at FROM users WHERE id = ?',
        [userId]
      ) as User;

      // Store in localStorage for persistence
      localStorage.setItem('taskmaster_user', JSON.stringify(user));

      return { user, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { user: null, error: 'Failed to create account' };
    }
  }

  // Sign in existing user
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      // Get user with password
      const userWithPassword = await db.findOne(
        'SELECT id, email, password_hash, full_name, created_at FROM users WHERE email = ?',
        [email]
      );

      if (!userWithPassword) {
        return { user: null, error: 'Invalid email or password' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, userWithPassword.password_hash);
      if (!isValidPassword) {
        return { user: null, error: 'Invalid email or password' };
      }

      // Return user without password
      const user: User = {
        id: userWithPassword.id,
        email: userWithPassword.email,
        full_name: userWithPassword.full_name,
        created_at: userWithPassword.created_at
      };

      // Store in localStorage for persistence
      localStorage.setItem('taskmaster_user', JSON.stringify(user));

      return { user, error: null };
    } catch (error) {
      console.error('Sign in error:', error);
      return { user: null, error: 'Failed to sign in' };
    }
  }

  // Sign out
  async signOut() {
    localStorage.removeItem('taskmaster_user');
  }

  // Get current user from localStorage
  getCurrentUser(): User | null {
    try {
      const userStr = localStorage.getItem('taskmaster_user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }
}

export const authService = new AuthService();
