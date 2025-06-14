
-- Create user roles system
CREATE TYPE public.app_role AS ENUM ('admin', 'sub_admin', 'employee');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'employee',
    department TEXT,
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, role)
);

-- Create teams/departments table
CREATE TABLE public.teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    manager_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create projects table for financial tracking
CREATE TABLE public.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    team_id UUID REFERENCES public.teams(id),
    manager_id UUID REFERENCES auth.users(id) NOT NULL,
    budget DECIMAL(10,2),
    expenses DECIMAL(10,2) DEFAULT 0,
    status TEXT DEFAULT 'active',
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create sticky notes table
CREATE TABLE public.sticky_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    color TEXT DEFAULT 'yellow',
    position_x INTEGER DEFAULT 0,
    position_y INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create comments table for collaboration
CREATE TABLE public.comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add project_id to tasks table
ALTER TABLE public.tasks ADD COLUMN project_id UUID REFERENCES public.projects(id);

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sticky_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to check if user can view other user's data
CREATE OR REPLACE FUNCTION public.can_view_user_data(_viewer_id UUID, _target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT 
    _viewer_id = _target_user_id OR
    public.has_role(_viewer_id, 'admin') OR
    (public.has_role(_viewer_id, 'sub_admin') AND EXISTS (
      SELECT 1 FROM public.user_roles ur1, public.user_roles ur2
      WHERE ur1.user_id = _viewer_id 
        AND ur2.user_id = _target_user_id
        AND ur1.department = ur2.department
    ))
$$;

-- RLS policies for user_roles
CREATE POLICY "Users can view accessible roles" 
  ON public.user_roles FOR SELECT 
  USING (public.can_view_user_data(auth.uid(), user_id));

CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for teams
CREATE POLICY "Teams are viewable by members and managers" 
  ON public.teams FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'admin') OR
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
        AND department = teams.name
    )
  );

-- RLS policies for projects
CREATE POLICY "Projects viewable by team members and managers" 
  ON public.projects FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'admin') OR
    manager_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.teams t, public.user_roles ur
      WHERE t.id = team_id 
        AND ur.user_id = auth.uid()
        AND ur.department = t.name
    )
  );

-- RLS policies for sticky notes
CREATE POLICY "Users can manage their own sticky notes" 
  ON public.sticky_notes FOR ALL 
  USING (auth.uid() = user_id);

-- RLS policies for comments
CREATE POLICY "Comments viewable by task/project participants" 
  ON public.comments FOR SELECT 
  USING (
    auth.uid() = user_id OR
    (task_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.tasks 
      WHERE id = task_id 
        AND public.can_view_user_data(auth.uid(), user_id)
    )) OR
    (project_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.projects 
      WHERE id = project_id 
        AND public.can_view_user_data(auth.uid(), manager_id)
    ))
  );

-- Create indexes for performance
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_teams_manager_id ON public.teams(manager_id);
CREATE INDEX idx_projects_team_id ON public.projects(team_id);
CREATE INDEX idx_projects_manager_id ON public.projects(manager_id);
CREATE INDEX idx_sticky_notes_user_id ON public.sticky_notes(user_id);
CREATE INDEX idx_comments_task_id ON public.comments(task_id);
CREATE INDEX idx_comments_project_id ON public.comments(project_id);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);

-- Create triggers for updated_at
CREATE TRIGGER handle_updated_at_teams
  BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_projects
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_sticky_notes
  BEFORE UPDATE ON public.sticky_notes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_comments
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
