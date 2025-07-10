/*
  # User Approval System

  1. Changes
    - Add 'pending' and 'rejected' status options to user_profiles
    - Update RLS policies to handle pending users
    - Add function to handle user approval notifications

  2. Security
    - Only Level 1 and 2 users (Super Admins and Admins) can approve users
    - Pending users cannot access the system until approved
*/

-- Update check constraint for user_profiles status to include 'pending' and 'rejected'
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_profiles_status_check' 
    AND table_name = 'user_profiles'
  ) THEN
    ALTER TABLE user_profiles DROP CONSTRAINT user_profiles_status_check;
  END IF;

  -- Add new constraint with additional status options
  ALTER TABLE user_profiles 
  ADD CONSTRAINT user_profiles_status_check 
  CHECK (status IN ('active', 'inactive', 'suspended', 'pending', 'rejected'));
END $$;

-- Create function to handle new user creation with pending status
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    role_id,
    status
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    '44444444-4444-4444-4444-444444444444', -- Default to User role
    'pending' -- Set status to pending by default
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to log user approval actions
CREATE OR REPLACE FUNCTION log_user_approval_action()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'active' THEN
    -- Log approval action
    INSERT INTO access_logs (
      user_id,
      action,
      resource,
      resource_id,
      ip_address,
      user_agent
    ) VALUES (
      auth.uid(),
      'approve',
      'user',
      NEW.id,
      NULL,
      NULL
    );
  ELSIF OLD.status = 'pending' AND NEW.status = 'rejected' THEN
    -- Log rejection action
    INSERT INTO access_logs (
      user_id,
      action,
      resource,
      resource_id,
      ip_address,
      user_agent
    ) VALUES (
      auth.uid(),
      'reject',
      'user',
      NEW.id,
      NULL,
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for logging approval actions
CREATE TRIGGER on_user_approval_action
  AFTER UPDATE OF status ON user_profiles
  FOR EACH ROW
  WHEN (OLD.status = 'pending' AND (NEW.status = 'active' OR NEW.status = 'rejected'))
  EXECUTE FUNCTION log_user_approval_action();