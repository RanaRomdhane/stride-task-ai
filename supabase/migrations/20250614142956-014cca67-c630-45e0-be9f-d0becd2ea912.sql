
-- Drop the old, recursive policies on user_roles
DROP POLICY "Admins can view all user roles" ON public.user_roles;
DROP POLICY "Sub-admins can view department user roles" ON public.user_roles;
DROP POLICY "Admins can manage all user roles" ON public.user_roles;
DROP POLICY "Sub-admins can update department user roles" ON public.user_roles;
DROP POLICY "Sub-admins can delete department user roles" ON public.user_roles;
DROP POLICY "Sub-admins can assign roles in department" ON public.user_roles;

-- Create helper functions to safely get user role and department inside policies
-- These use SECURITY DEFINER to avoid recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS public.app_role AS $$
  SELECT role FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.get_my_department()
RETURNS TEXT AS $$
  SELECT department FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Create new, corrected policies for the user_roles table

-- Policy for SELECT
CREATE POLICY "Users can view roles based on hierarchy"
ON public.user_roles FOR SELECT USING (
  auth.uid() = user_id OR -- Users can see their own role
  public.get_my_role() = 'admin' OR -- Admins can see all roles
  (public.get_my_role() = 'sub_admin' AND public.get_my_department() = department) -- Sub-admins can see roles in their department
);

-- Policy for INSERT
CREATE POLICY "Users can insert roles based on hierarchy"
ON public.user_roles FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin' OR -- Admins can insert any role
  (public.get_my_role() = 'sub_admin' AND public.get_my_department() = department AND role <> 'admin') -- Sub-admins can insert roles (but not admin) into their department
);

-- Policy for UPDATE
CREATE POLICY "Users can update roles based on hierarchy"
ON public.user_roles FOR UPDATE USING (
  public.get_my_role() = 'admin' OR
  (public.get_my_role() = 'sub_admin' AND public.get_my_department() = department)
) WITH CHECK (
  public.get_my_role() = 'admin' OR
  (public.get_my_role() = 'sub_admin' AND public.get_my_department() = department AND role <> 'admin')
);

-- Policy for DELETE
CREATE POLICY "Users can delete roles based on hierarchy"
ON public.user_roles FOR DELETE USING (
  public.get_my_role() = 'admin' OR
  (public.get_my_role() = 'sub_admin' AND public.get_my_department() = department AND user_roles.role <> 'admin')
);
