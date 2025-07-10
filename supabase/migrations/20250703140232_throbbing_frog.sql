/*
  # User Management System Schema

  1. New Tables
    - `user_roles`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `description` (text)
      - `permissions` (jsonb)
      - `level` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `user_profiles`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `email` (text, unique)
      - `first_name` (text)
      - `last_name` (text)
      - `avatar_url` (text)
      - `phone` (text)
      - `department` (text)
      - `job_title` (text)
      - `role_id` (uuid, foreign key)
      - `status` (text)
      - `last_login` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `access_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid)
      - `action` (text)
      - `resource` (text)
      - `resource_id` (text)
      - `ip_address` (text)
      - `user_agent` (text)
      - `timestamp` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for role-based access control
    - Create indexes for performance

  3. Default Data
    - Insert default roles (Super Admin, Admin, Manager, User)
*/

-- Create user_roles table
CREATE TABLE IF NOT EXISTS user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text NOT NULL,
  permissions jsonb DEFAULT '[]'::jsonb,
  level integer NOT NULL DEFAULT 4,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  avatar_url text,
  phone text,
  department text,
  job_title text,
  role_id uuid REFERENCES user_roles(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active',
  last_login timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create access_logs table
CREATE TABLE IF NOT EXISTS access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action text NOT NULL,
  resource text NOT NULL,
  resource_id text,
  ip_address text,
  user_agent text,
  timestamp timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
CREATE POLICY "Super admins can manage roles"
  ON user_roles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level = 1
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level = 1
    )
  );

CREATE POLICY "Users can read roles"
  ON user_roles FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level <= 2
    )
  );

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level <= 2
    )
  );

CREATE POLICY "Admins can update all profiles"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level <= 2
    )
  )
  WITH CHECK (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level <= 2
    )
  );

CREATE POLICY "Admins can delete profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level <= 2
    )
  );

-- Create policies for access_logs
CREATE POLICY "Users can read own access logs"
  ON access_logs FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level <= 2
    )
  );

CREATE POLICY "System can insert access logs"
  ON access_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role_id ON user_profiles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(timestamp);

-- Insert default roles
INSERT INTO user_roles (id, name, description, permissions, level) VALUES
('11111111-1111-1111-1111-111111111111', 'Super Admin', 'Full system access with all permissions', 
 '[
   {"resource": "*", "actions": ["*"]},
   {"resource": "users", "actions": ["create", "read", "update", "delete"]},
   {"resource": "roles", "actions": ["create", "read", "update", "delete"]},
   {"resource": "apps", "actions": ["create", "read", "update", "delete"]},
   {"resource": "customers", "actions": ["create", "read", "update", "delete"]},
   {"resource": "subscriptions", "actions": ["create", "read", "update", "delete"]},
   {"resource": "plans", "actions": ["create", "read", "update", "delete"]},
   {"resource": "analytics", "actions": ["read"]},
   {"resource": "settings", "actions": ["read", "update"]}
 ]'::jsonb, 1),
('22222222-2222-2222-2222-222222222222', 'Admin', 'Administrative access to most features',
 '[
   {"resource": "users", "actions": ["create", "read", "update"]},
   {"resource": "apps", "actions": ["create", "read", "update", "delete"]},
   {"resource": "customers", "actions": ["create", "read", "update", "delete"]},
   {"resource": "subscriptions", "actions": ["create", "read", "update", "delete"]},
   {"resource": "plans", "actions": ["create", "read", "update", "delete"]},
   {"resource": "analytics", "actions": ["read"]},
   {"resource": "settings", "actions": ["read"]}
 ]'::jsonb, 2),
('33333333-3333-3333-3333-333333333333', 'Manager', 'Management access to business operations',
 '[
   {"resource": "customers", "actions": ["create", "read", "update"]},
   {"resource": "subscriptions", "actions": ["read", "update"]},
   {"resource": "plans", "actions": ["read"]},
   {"resource": "analytics", "actions": ["read"]}
 ]'::jsonb, 3),
('44444444-4444-4444-4444-444444444444', 'User', 'Basic user access with limited permissions',
 '[
   {"resource": "customers", "actions": ["read"]},
   {"resource": "subscriptions", "actions": ["read"]},
   {"resource": "analytics", "actions": ["read"]}
 ]'::jsonb, 4);