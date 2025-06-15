
// This file is kept for compatibility with existing components
// All Supabase functionality has been replaced with MySQL
console.warn('Supabase client is no longer used. This project now uses MySQL.');

export const supabase = {
  auth: {
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    getSession: () => Promise.resolve({ data: { session: null } }),
    signOut: () => Promise.resolve({ error: null }),
  }
};
