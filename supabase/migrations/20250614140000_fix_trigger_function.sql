
-- Fix the trigger function to properly use the existing app_role enum
CREATE OR REPLACE FUNCTION assign_demo_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Assign roles based on email patterns or role from user metadata
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    -- Use the role from signup metadata
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'admin@taskmaster.ai' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'subadmin@taskmaster.ai' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'sub_admin'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSIF NEW.email = 'employee@taskmaster.ai' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  ELSE
    -- Default role for other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee'::public.app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created_assign_roles ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION assign_demo_roles();
