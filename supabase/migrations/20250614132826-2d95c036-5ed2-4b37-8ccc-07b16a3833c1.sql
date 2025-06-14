
-- Insert demo user accounts with proper authentication setup
-- Note: These will be created as users that need email confirmation
-- The passwords will be hashed by Supabase Auth

-- First, let's ensure we have the user roles ready
INSERT INTO public.user_roles (user_id, role) 
SELECT 
  '1a79ce95-c793-4b02-8618-9c76abb20021'::uuid,
  'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = '1a79ce95-c793-4b02-8618-9c76abb20021'::uuid 
  AND role = 'admin'::app_role
);

-- Create additional demo user roles (these will be linked when users sign up)
-- We'll create placeholder entries that will be updated when users actually register

-- For now, let's create a simple way to assign roles after signup
-- Admin role assignment function
CREATE OR REPLACE FUNCTION assign_demo_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign roles based on email patterns
  IF NEW.email = 'admin@taskmaster.ai' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'subadmin@taskmaster.ai' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'sub_admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'employee@taskmaster.ai' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default role for other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-assign roles on user creation
DROP TRIGGER IF EXISTS on_auth_user_created_assign_roles ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_demo_roles();
