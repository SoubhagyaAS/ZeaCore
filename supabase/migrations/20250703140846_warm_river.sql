/*
  # Fix User Profiles and Current User Setup

  1. Create user profile for existing authenticated users
  2. Add trigger to automatically create profiles for new auth users
  3. Fix any missing relationships

  This ensures that all authenticated users have corresponding profiles.
*/

-- Create a function to automatically create user profiles when auth users are created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email, first_name, last_name, role_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    '44444444-4444-4444-4444-444444444444' -- Default to User role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profiles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create profiles for any existing auth users that don't have profiles
INSERT INTO public.user_profiles (user_id, email, first_name, last_name, role_id, status)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)),
  COALESCE(au.raw_user_meta_data->>'last_name', 'User'),
  '22222222-2222-2222-2222-222222222222', -- Default to Admin role for existing users
  'active'
FROM auth.users au
LEFT JOIN public.user_profiles up ON au.id = up.user_id
WHERE up.user_id IS NULL;

-- Update the get_current_user_role_level function to handle missing profiles better
CREATE OR REPLACE FUNCTION get_current_user_role_level()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  role_level INTEGER;
BEGIN
  SELECT ur.level INTO role_level
  FROM user_profiles up
  JOIN user_roles ur ON up.role_id = ur.id
  WHERE up.user_id = auth.uid();
  
  -- If no profile exists, return a high number (low privilege)
  RETURN COALESCE(role_level, 999);
END;
$$;