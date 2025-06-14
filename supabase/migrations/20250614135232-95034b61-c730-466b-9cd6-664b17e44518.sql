
-- First, let's check if the app_role enum exists and create it if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('admin', 'sub_admin', 'employee');
    END IF;
END $$;

-- Ensure the user_roles table uses the correct enum type
ALTER TABLE public.user_roles 
ALTER COLUMN role TYPE public.app_role USING role::text::public.app_role;

-- Fix the trigger function with proper error handling
CREATE OR REPLACE FUNCTION public.assign_demo_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Add error handling and logging
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
  EXCEPTION
    WHEN OTHERS THEN
      -- Log the error but don't fail the user creation
      RAISE WARNING 'Failed to assign role to user %: %', NEW.id, SQLERRM;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS on_auth_user_created_assign_roles ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_roles
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.assign_demo_roles();
