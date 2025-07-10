-- Create access_logs table for comprehensive activity tracking
CREATE TABLE IF NOT EXISTS access_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- create, read, update, delete, login, logout, approve, reject, etc.
  resource VARCHAR(100) NOT NULL, -- apps, customers, subscriptions, users, features, etc.
  resource_id UUID, -- ID of the specific resource being acted upon
  resource_name VARCHAR(255), -- Human-readable name of the resource
  ip_address INET,
  user_agent TEXT,
  request_method VARCHAR(10), -- GET, POST, PUT, DELETE, etc.
  request_url TEXT,
  request_body JSONB, -- Store request data for debugging
  response_status INTEGER,
  response_body JSONB, -- Store response data for debugging
  session_id VARCHAR(255),
  browser_info JSONB, -- Browser, OS, device info
  location_info JSONB, -- Country, city, timezone
  metadata JSONB, -- Additional context data
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_action ON access_logs(action);
CREATE INDEX IF NOT EXISTS idx_access_logs_resource ON access_logs(resource);
CREATE INDEX IF NOT EXISTS idx_access_logs_timestamp ON access_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_access_logs_ip_address ON access_logs(ip_address);

-- Create RLS policies for access_logs
ALTER TABLE access_logs ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own logs
CREATE POLICY "Users can view their own access logs" ON access_logs
  FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to read all logs
CREATE POLICY "Admins can view all access logs" ON access_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.user_id = auth.uid() AND ur.level <= 2
    )
  );

-- Allow system to insert logs
CREATE POLICY "System can insert access logs" ON access_logs
  FOR INSERT WITH CHECK (true);

-- Create function to automatically log user actions
CREATE OR REPLACE FUNCTION log_user_action(
  p_action VARCHAR(50),
  p_resource VARCHAR(100),
  p_resource_id UUID DEFAULT NULL,
  p_resource_name VARCHAR(255) DEFAULT NULL,
  p_request_method VARCHAR(10) DEFAULT NULL,
  p_request_url TEXT DEFAULT NULL,
  p_request_body JSONB DEFAULT NULL,
  p_response_status INTEGER DEFAULT NULL,
  p_response_body JSONB DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
  current_user_id UUID;
  current_ip INET;
  current_user_agent TEXT;
  current_session_id VARCHAR(255);
  browser_info JSONB;
  location_info JSONB;
BEGIN
  -- Get current user ID
  current_user_id := auth.uid();
  
  -- Get request information (these would be passed from the application)
  current_ip := COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', 
                        current_setting('request.headers', true)::json->>'x-real-ip')::INET;
  current_user_agent := current_setting('request.headers', true)::json->>'user-agent';
  current_session_id := current_setting('request.headers', true)::json->>'x-session-id';
  
  -- Parse browser information from user agent
  browser_info := jsonb_build_object(
    'user_agent', current_user_agent,
    'browser', COALESCE(current_setting('request.headers', true)::json->>'sec-ch-ua', 'Unknown'),
    'platform', COALESCE(current_setting('request.headers', true)::json->>'sec-ch-ua-platform', 'Unknown')
  );
  
  -- Insert the log entry
  INSERT INTO access_logs (
    user_id,
    action,
    resource,
    resource_id,
    resource_name,
    ip_address,
    user_agent,
    request_method,
    request_url,
    request_body,
    response_status,
    response_body,
    session_id,
    browser_info,
    location_info,
    metadata
  ) VALUES (
    current_user_id,
    p_action,
    p_resource,
    p_resource_id,
    p_resource_name,
    current_ip,
    current_user_agent,
    p_request_method,
    p_request_url,
    p_request_body,
    p_response_status,
    p_response_body,
    current_session_id,
    browser_info,
    location_info,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log login/logout events
CREATE OR REPLACE FUNCTION log_auth_event(
  p_action VARCHAR(50), -- 'login' or 'logout'
  p_user_id UUID DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  log_id UUID;
  current_ip INET;
  current_user_agent TEXT;
BEGIN
  -- Get request information
  current_ip := COALESCE(current_setting('request.headers', true)::json->>'x-forwarded-for', 
                        current_setting('request.headers', true)::json->>'x-real-ip')::INET;
  current_user_agent := current_setting('request.headers', true)::json->>'user-agent';
  
  -- Insert the log entry
  INSERT INTO access_logs (
    user_id,
    action,
    resource,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    COALESCE(p_user_id, auth.uid()),
    p_action,
    'auth',
    current_ip,
    current_user_agent,
    p_metadata
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically log user profile updates
CREATE OR REPLACE FUNCTION log_user_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the change
  PERFORM log_user_action(
    'update',
    'user_profile',
    NEW.id,
    NEW.first_name || ' ' || NEW.last_name,
    'PUT',
    '/api/user-profiles/' || NEW.id,
    to_jsonb(NEW),
    NULL,
    NULL,
    jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for user profile changes
CREATE TRIGGER on_user_profile_change
  AFTER UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_user_profile_changes();

-- Create trigger to log new user registrations
CREATE OR REPLACE FUNCTION log_user_registration()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the registration
  PERFORM log_user_action(
    'create',
    'user_profile',
    NEW.id,
    NEW.first_name || ' ' || NEW.last_name,
    'POST',
    '/api/user-profiles',
    to_jsonb(NEW),
    201,
    NULL,
    jsonb_build_object('registration_method', 'signup')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registrations
CREATE TRIGGER on_user_registration
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION log_user_registration();

-- Update the database types
COMMENT ON TABLE access_logs IS 'Comprehensive access logging for user activities and system events';
COMMENT ON COLUMN access_logs.action IS 'The action performed (create, read, update, delete, login, logout, etc.)';
COMMENT ON COLUMN access_logs.resource IS 'The resource being acted upon (apps, customers, subscriptions, users, etc.)';
COMMENT ON COLUMN access_logs.resource_id IS 'The UUID of the specific resource being acted upon';
COMMENT ON COLUMN access_logs.resource_name IS 'Human-readable name of the resource';
COMMENT ON COLUMN access_logs.metadata IS 'Additional context data for the action'; 