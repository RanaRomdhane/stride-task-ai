
// API service layer - easily replaceable with real backend calls
// This abstracts the data layer and can be switched from mock to real API

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  success: boolean;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    // For local development with real backend, change this to your API URL
    this.baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001/api'  // NestJS default port
      : '/api';
  }

  // Generic API call method - ready for real backend integration
  private async apiCall<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      // For now, this will use the mock database
      // When you have a real backend, uncomment the fetch call below
      
      /*
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null, success: true };
      */

      // Mock implementation - remove when using real backend
      return { data: null, error: 'Mock API - implement real backend', success: false };
    } catch (error) {
      console.error('API call failed:', error);
      return { 
        data: null, 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      };
    }
  }

  // Authentication endpoints
  async signIn(email: string, password: string) {
    return this.apiCall('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async signUp(email: string, password: string, fullName: string) {
    return this.apiCall('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    });
  }

  async signOut() {
    return this.apiCall('/auth/signout', {
      method: 'POST',
    });
  }

  // Task endpoints
  async getTasks(userId: string) {
    return this.apiCall(`/tasks?userId=${userId}`, {
      method: 'GET',
    });
  }

  async createTask(task: any, userId: string) {
    return this.apiCall('/tasks', {
      method: 'POST',
      body: JSON.stringify({ ...task, userId }),
    });
  }

  async updateTask(taskId: string, updates: any) {
    return this.apiCall(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteTask(taskId: string) {
    return this.apiCall(`/tasks/${taskId}`, {
      method: 'DELETE',
    });
  }

  // User management endpoints
  async getUsers() {
    return this.apiCall('/users', {
      method: 'GET',
    });
  }

  async updateUserRole(userId: string, role: string) {
    return this.apiCall(`/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }
}

export const apiService = new ApiService();
