
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types for better data consistency
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE task_status AS ENUM ('inbox', 'next-action', 'waiting-for', 'project', 'someday-maybe', 'completed');
CREATE TYPE batch_priority AS ENUM ('low', 'medium', 'high');

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  priority task_priority NOT NULL DEFAULT 'medium',
  status task_status NOT NULL DEFAULT 'inbox',
  category TEXT DEFAULT '',
  estimated_duration INTEGER NOT NULL DEFAULT 30, -- in minutes
  deadline TIMESTAMPTZ,
  dependencies TEXT[] DEFAULT '{}', -- array of task IDs
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  urgent BOOLEAN NOT NULL DEFAULT FALSE,
  important BOOLEAN NOT NULL DEFAULT FALSE,
  batch_id UUID,
  pomodoro_sessions INTEGER NOT NULL DEFAULT 0,
  context TEXT DEFAULT ''
);

-- Create task batches table
CREATE TABLE public.task_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  tasks TEXT[] DEFAULT '{}', -- array of task IDs
  total_duration INTEGER NOT NULL DEFAULT 0, -- in minutes
  context TEXT DEFAULT '',
  priority batch_priority NOT NULL DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  scheduled TIMESTAMPTZ
);

-- Create pomodoro sessions table
CREATE TABLE public.pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Create user profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  work_hours_start TIME DEFAULT '09:00',
  work_hours_end TIME DEFAULT '17:00',
  default_pomodoro_duration INTEGER DEFAULT 25,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint for batch_id in tasks
ALTER TABLE public.tasks 
ADD CONSTRAINT fk_tasks_batch_id 
FOREIGN KEY (batch_id) REFERENCES public.task_batches(id) ON DELETE SET NULL;

-- Enable Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pomodoro_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "Users can view their own tasks" 
  ON public.tasks FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tasks" 
  ON public.tasks FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tasks" 
  ON public.tasks FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tasks" 
  ON public.tasks FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for task batches
CREATE POLICY "Users can view their own batches" 
  ON public.task_batches FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own batches" 
  ON public.task_batches FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own batches" 
  ON public.task_batches FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own batches" 
  ON public.task_batches FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for pomodoro sessions
CREATE POLICY "Users can view their own pomodoro sessions" 
  ON public.pomodoro_sessions FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pomodoro sessions" 
  ON public.pomodoro_sessions FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro sessions" 
  ON public.pomodoro_sessions FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro sessions" 
  ON public.pomodoro_sessions FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can create their own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Create function to automatically create user profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER handle_updated_at_tasks
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes for better performance
CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_deadline ON public.tasks(deadline);
CREATE INDEX idx_task_batches_user_id ON public.task_batches(user_id);
CREATE INDEX idx_pomodoro_sessions_user_id ON public.pomodoro_sessions(user_id);
CREATE INDEX idx_pomodoro_sessions_task_id ON public.pomodoro_sessions(task_id);
