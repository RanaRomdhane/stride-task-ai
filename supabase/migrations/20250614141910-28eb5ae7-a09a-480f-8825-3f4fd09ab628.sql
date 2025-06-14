
-- Enable RLS policies for proper user data access
-- Allow admins to view all user roles
CREATE POLICY "Admins can view all user roles" 
  ON public.user_roles FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow sub-admins to view user roles in their department
CREATE POLICY "Sub-admins can view department user roles" 
  ON public.user_roles FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'sub_admin') AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
        AND ur.department = user_roles.department
    )
  );

-- Allow admins to manage all user roles
CREATE POLICY "Admins can manage all user roles" 
  ON public.user_roles FOR ALL 
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow sub-admins to update user roles in their department
CREATE POLICY "Sub-admins can update department user roles" 
  ON public.user_roles FOR UPDATE 
  USING (
    public.has_role(auth.uid(), 'sub_admin') AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
        AND ur.department = user_roles.department
    )
  );

-- Allow sub-admins to delete user roles in their department
CREATE POLICY "Sub-admins can delete department user roles" 
  ON public.user_roles FOR DELETE 
  USING (
    public.has_role(auth.uid(), 'sub_admin') AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      WHERE ur.user_id = auth.uid() 
        AND ur.department = user_roles.department
    )
  );

-- Allow sub-admins to assign roles to users in their department
CREATE POLICY "Sub-admins can assign roles in department" 
  ON public.user_roles FOR INSERT 
  WITH CHECK (
    public.has_role(auth.uid(), 'admin') OR
    (public.has_role(auth.uid(), 'sub_admin') AND
     EXISTS (
       SELECT 1 FROM public.user_roles ur
       WHERE ur.user_id = auth.uid() 
         AND ur.department = user_roles.department
     ))
  );

-- Allow admins and sub-admins to view profiles of users they can manage
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sub-admins can view department profiles" 
  ON public.profiles FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'sub_admin') AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur1, public.user_roles ur2
      WHERE ur1.user_id = auth.uid() 
        AND ur2.user_id = profiles.id
        AND ur1.department = ur2.department
    )
  );

-- Allow users to view tasks based on role hierarchy
CREATE POLICY "Admins can view all tasks" 
  ON public.tasks FOR SELECT 
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Sub-admins can view department tasks" 
  ON public.tasks FOR SELECT 
  USING (
    public.has_role(auth.uid(), 'sub_admin') AND
    EXISTS (
      SELECT 1 FROM public.user_roles ur1, public.user_roles ur2
      WHERE ur1.user_id = auth.uid() 
        AND ur2.user_id = tasks.user_id
        AND ur1.department = ur2.department
    )
  );

-- Users can view their own tasks
CREATE POLICY "Users can view own tasks" 
  ON public.tasks FOR SELECT 
  USING (auth.uid() = user_id);
