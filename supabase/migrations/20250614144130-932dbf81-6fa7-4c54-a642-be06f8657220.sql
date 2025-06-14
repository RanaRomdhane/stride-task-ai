
-- Drop old, inefficient policies
DROP POLICY "Sub-admins can view department profiles" ON public.profiles;
DROP POLICY "Sub-admins can view department tasks" ON public.tasks;

-- Create a function to get a specific user's department.
-- SECURITY DEFINER is crucial to bypass RLS when called from another policy.
CREATE OR REPLACE FUNCTION public.get_user_department(p_user_id uuid)
RETURNS text AS $$
  SELECT department FROM public.user_roles WHERE user_id = p_user_id LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;


-- Re-create policies using the helper functions to make them simpler and non-recursive

-- New policy for profiles table
CREATE POLICY "Sub-admins can view department profiles"
ON public.profiles FOR SELECT
USING (
  public.get_my_role() = 'sub_admin' AND
  public.get_my_department() = public.get_user_department(profiles.id)
);

-- New policy for tasks table
CREATE POLICY "Sub-admins can view department tasks"
ON public.tasks FOR SELECT
USING (
  public.get_my_role() = 'sub_admin' AND
  public.get_my_department() = public.get_user_department(tasks.user_id)
);
