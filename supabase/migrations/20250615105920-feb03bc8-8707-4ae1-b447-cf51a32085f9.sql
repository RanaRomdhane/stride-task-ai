
-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('task_update', 'deadline_reminder', 'comment', 'assignment', 'mention')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  entity_id UUID, -- Can reference task, project, or comment
  entity_type TEXT CHECK (entity_type IN ('task', 'project', 'comment')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification settings table
CREATE TABLE IF NOT EXISTS public.notification_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  in_app_notifications BOOLEAN NOT NULL DEFAULT true,
  task_updates BOOLEAN NOT NULL DEFAULT true,
  deadline_reminders BOOLEAN NOT NULL DEFAULT true,
  comments BOOLEAN NOT NULL DEFAULT true,
  assignments BOOLEAN NOT NULL DEFAULT true,
  mentions BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create task assignments table for shared ownership
CREATE TABLE IF NOT EXISTS public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'assignee' CHECK (role IN ('owner', 'assignee', 'collaborator')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Create group messages table
CREATE TABLE IF NOT EXISTS public.group_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  file_url TEXT,
  file_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create message groups table
CREATE TABLE IF NOT EXISTS public.message_groups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create group members table
CREATE TABLE IF NOT EXISTS public.group_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.message_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);

-- Create meetings table
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  meeting_url TEXT,
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create meeting attendees table
CREATE TABLE IF NOT EXISTS public.meeting_attendees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'accepted', 'declined', 'tentative')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(meeting_id, user_id)
);

-- Add triggers for updated_at columns (only if tables were created)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'notification_settings') THEN
    CREATE TRIGGER update_notification_settings_updated_at
      BEFORE UPDATE ON public.notification_settings
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'meetings') THEN
    CREATE TRIGGER update_meetings_updated_at
      BEFORE UPDATE ON public.meetings
      FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
  END IF;
END $$;

-- Enable RLS on all new tables
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meeting_attendees ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for comments (skip if already exist)
DO $$
BEGIN
  -- Check if policy doesn't exist before creating
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Users can view comments on tasks/projects they have access to'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view comments on tasks/projects they have access to"
      ON public.comments FOR SELECT
      USING (
        (task_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.tasks t WHERE t.id = task_id AND 
          (t.user_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.task_assignments ta WHERE ta.task_id = t.id AND ta.user_id = auth.uid()
          ))
        )) OR
        (project_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.projects p WHERE p.id = project_id AND 
          (p.manager_id = auth.uid() OR public.has_role(auth.uid(), ''admin''))
        ))
      )';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'comments' 
    AND policyname = 'Users can create comments on accessible tasks/projects'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can create comments on accessible tasks/projects"
      ON public.comments FOR INSERT
      WITH CHECK (
        user_id = auth.uid() AND (
          (task_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.tasks t WHERE t.id = task_id AND 
            (t.user_id = auth.uid() OR EXISTS (
              SELECT 1 FROM public.task_assignments ta WHERE ta.task_id = t.id AND ta.user_id = auth.uid()
            ))
          )) OR
          (project_id IS NOT NULL AND EXISTS (
            SELECT 1 FROM public.projects p WHERE p.id = project_id AND 
            (p.manager_id = auth.uid() OR public.has_role(auth.uid(), ''admin''))
          ))
        )
      )';
  END IF;
END $$;

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Create RLS policies for notification settings
CREATE POLICY "Users can manage their own notification settings"
  ON public.notification_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create RLS policies for task assignments
CREATE POLICY "Users can view task assignments for accessible tasks"
  ON public.task_assignments FOR SELECT
  USING (
    user_id = auth.uid() OR 
    assigned_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.user_id = auth.uid()
    ) OR
    public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Task owners and admins can create assignments"
  ON public.task_assignments FOR INSERT
  WITH CHECK (
    assigned_by = auth.uid() AND (
      EXISTS (
        SELECT 1 FROM public.tasks t WHERE t.id = task_id AND t.user_id = auth.uid()
      ) OR
      public.has_role(auth.uid(), 'admin')
    )
  );

-- Create function to auto-create notification settings for new users
CREATE OR REPLACE FUNCTION create_notification_settings_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notification_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-creating notification settings
DROP TRIGGER IF EXISTS on_auth_user_created_notification_settings ON auth.users;
CREATE TRIGGER on_auth_user_created_notification_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_notification_settings_for_new_user();

-- Add real-time publication for new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
