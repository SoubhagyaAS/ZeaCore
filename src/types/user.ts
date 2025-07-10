export interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  level: number; // 1 = Super Admin, 2 = Admin, 3 = Manager, 4 = User
  created_at: string;
  updated_at: string;
}

export interface Permission {
  id: string;
  name: string;
  resource: string; // e.g., 'apps', 'customers', 'subscriptions'
  action: string; // e.g., 'create', 'read', 'update', 'delete'
  description: string;
}

export interface UserProfile {
  id: string;
  user_id: string; // References auth.users
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  phone?: string;
  department?: string;
  job_title?: string;
  role_id: string;
  status: 'active' | 'inactive' | 'suspended' | 'pending' | 'rejected';
  last_login?: string;
  created_at: string;
  updated_at: string;
  role?: UserRole;
}

export interface PendingUser extends UserProfile {
  // Additional fields specific to pending users can be added here
}

export interface AccessLog {
  id: string;
  user_id: string | null;
  action: string;
  resource: string;
  resource_id?: string | null;
  resource_name?: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
  request_method?: string | null;
  request_url?: string | null;
  request_body?: any | null;
  response_status?: number | null;
  response_body?: any | null;
  session_id?: string | null;
  browser_info?: any | null;
  location_info?: any | null;
  metadata?: any | null;
  created_at: string;
  updated_at: string;
}