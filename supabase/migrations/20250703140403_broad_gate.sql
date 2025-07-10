/*
  # Fix infinite recursion in user_profiles RLS policies

  1. Problem
    - Current RLS policies on user_profiles table create infinite recursion
    - Policies that check user roles by joining to user_profiles create circular dependencies
    - This happens when a policy queries the same table it's protecting

  2. Solution
    - Drop existing problematic policies
    - Create simplified policies that avoid self-referencing queries
    - Use direct user_id checks and role_id comparisons instead of joins
    - Separate role-based access from user-based access

  3. New Policies
    - Users can read and update their own profile (simple user_id check)
    - Super admins can manage all profiles (direct role_id check)
    - Remove complex subqueries that cause recursion
*/

-- Drop all existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Admins can delete profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

-- Create simple, non-recursive policies

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Allow super admins to read all profiles (using direct role_id check)
-- We'll use a function to get the current user's role to avoid recursion
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
  
  RETURN COALESCE(role_level, 999); -- Return high number if no role found
END;
$$;

-- Super admins can read all profiles
CREATE POLICY "Super admins can read all profiles"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (get_current_user_role_level() <= 2);

-- Super admins can insert new profiles
CREATE POLICY "Super admins can insert profiles"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_role_level() <= 2);

-- Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (get_current_user_role_level() <= 2)
  WITH CHECK (get_current_user_role_level() <= 2);

-- Super admins can delete profiles
CREATE POLICY "Super admins can delete profiles"
  ON user_profiles
  FOR DELETE
  TO authenticated
  USING (get_current_user_role_level() <= 2);

-- Also fix the user_roles policies to avoid similar issues
DROP POLICY IF EXISTS "Super admins can manage roles" ON user_roles;

-- Create a simpler policy for user_roles
CREATE POLICY "Super admins can manage roles"
  ON user_roles
  FOR ALL
  TO authenticated
  USING (get_current_user_role_level() = 1)
  WITH CHECK (get_current_user_role_level() = 1);