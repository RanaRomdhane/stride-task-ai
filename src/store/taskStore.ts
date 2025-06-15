
// Legacy Supabase store - replaced by MySQL services
// This file can be removed once all components use the new MySQL services

import { create } from 'zustand';

interface TaskStore {
  // Minimal interface for backward compatibility
  tasks: any[];
  loading: boolean;
}

// Empty store for legacy compatibility
export const useTaskStore = create<TaskStore>(() => ({
  tasks: [],
  loading: false,
}));

// Note: This store is deprecated. Use the new MySQL services:
// - src/services/taskService.ts
// - src/services/authService.ts
console.warn('taskStore.ts is deprecated. Use MySQL services instead.');
