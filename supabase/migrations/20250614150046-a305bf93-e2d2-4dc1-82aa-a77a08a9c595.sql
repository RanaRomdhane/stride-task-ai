
-- Update the policy to allow sub-admins to see users without departments
DROP POLICY "Users can view roles based on hierarchy" ON public.user_roles;

CREATE POLICY "Users can view roles based on hierarchy"
ON public.user_roles FOR SELECT USING (
  auth.uid() = user_id OR -- Users can see their own role
  public.get_my_role() = 'admin' OR -- Admins can see all roles
  (public.get_my_role() = 'sub_admin' AND (
    public.get_my_department() = department OR -- Sub-admins can see roles in their department
    department IS NULL -- Sub-admins can also see users without departments
  ))
);

-- Update the profiles policy to allow sub-admins to see profiles of users without departments
DROP POLICY "Sub-admins can view department profiles" ON public.profiles;

CREATE POLICY "Sub-admins can view department profiles"
ON public.profiles FOR SELECT
USING (
  public.get_my_role() = 'sub_admin' AND (
    public.get_my_department() = public.get_user_department(profiles.id) OR
    public.get_user_department(profiles.id) IS NULL -- Allow viewing profiles of users without departments
  )
);

-- Update the INSERT policy to allow sub-admins to assign users to their department
DROP POLICY "Users can insert roles based on hierarchy" ON public.user_roles;

CREATE POLICY "Users can insert roles based on hierarchy"
ON public.user_roles FOR INSERT WITH CHECK (
  public.get_my_role() = 'admin' OR -- Admins can insert any role
  (public.get_my_role() = 'sub_admin' AND 
   public.get_my_department() = department AND 
   role <> 'admin') -- Sub-admins can insert roles (but not admin) into their department
);

-- Update the UPDATE policy to allow sub-admins to update users without departments
DROP POLICY "Users can update roles based on hierarchy" ON public.user_roles;

CREATE POLICY "Users can update roles based on hierarchy"
ON public.user_roles FOR UPDATE USING (
  public.get_my_role() = 'admin' OR
  (public.get_my_role() = 'sub_admin' AND (
    public.get_my_department() = department OR -- Can update users in their department
    department IS NULL -- Can update users without departments (to assign them)
  ))
) WITH CHECK (
  public.get_my_role() = 'admin' OR
  (public.get_my_role() = 'sub_admin' AND 
   public.get_my_department() = department AND 
   role <> 'admin') -- Can only assign to their department and not admin role
);
