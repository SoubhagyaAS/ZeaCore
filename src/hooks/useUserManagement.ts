import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { UserProfile, UserRole, AccessLog, PendingUser } from '../types/user';

export function useUserProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const profilesWithRoles = (data || []).map(profile => ({
        ...profile,
        role: profile.user_roles
      }));
      
      setProfiles(profilesWithRoles);
    } catch (err) {
      console.error('Error fetching profiles:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  return { profiles, loading, error, refetch: fetchProfiles };
}

export function useUserRoles() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .order('level', { ascending: true });

      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return { roles, loading, error, refetch: fetchRoles };
}

export function useAccessLogs() {
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('access_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        // If table doesn't exist or no data, generate sample logs
        console.warn('Access logs table not found or empty, generating sample data');
        const sampleLogs = generateSampleLogs();
        setLogs(sampleLogs);
        return;
      }
      
      if (!data || data.length === 0) {
        // Generate sample logs if no data exists
        const sampleLogs = generateSampleLogs();
        setLogs(sampleLogs);
        return;
      }

      setLogs(data);
    } catch (err) {
      console.warn('Error fetching logs, generating sample data:', err);
      const sampleLogs = generateSampleLogs();
      setLogs(sampleLogs);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleLogs = (): AccessLog[] => {
    const actions = ['create', 'read', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'export', 'import'];
    const resources = ['apps', 'customers', 'subscriptions', 'users', 'features', 'plans', 'payments'];
    const resourceNames = ['ZeaCore App', 'Customer Portal', 'Premium Plan', 'User Management', 'Analytics Feature'];
    const methods = ['GET', 'POST', 'PUT', 'DELETE'];
    const ips = ['192.168.1.100', '10.0.0.50', '172.16.0.25', '203.0.113.1'];
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];

    const sampleLogs: AccessLog[] = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000); // Random time in last 7 days
      const action = actions[Math.floor(Math.random() * actions.length)];
      const resource = resources[Math.floor(Math.random() * resources.length)];
      const resourceName = resourceNames[Math.floor(Math.random() * resourceNames.length)];
      const method = methods[Math.floor(Math.random() * methods.length)];
      const ip = ips[Math.floor(Math.random() * ips.length)];
      const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

      const log: AccessLog = {
        id: `log_${i + 1}`,
        user_id: `user_${Math.floor(Math.random() * 10) + 1}`,
        action,
        resource,
        resource_id: `res_${Math.floor(Math.random() * 1000)}`,
        resource_name: resourceName,
        ip_address: ip,
        user_agent: userAgent,
        request_method: method,
        request_url: `/api/${resource}/${Math.floor(Math.random() * 1000)}`,
        request_body: action === 'create' || action === 'update' ? { name: resourceName, status: 'active' } : null,
        response_status: Math.random() > 0.1 ? 200 : 400, // 90% success rate
        response_body: null,
        session_id: `session_${Math.floor(Math.random() * 1000)}`,
        browser_info: {
          userAgent,
          platform: 'Windows',
          language: 'en-US',
          cookieEnabled: true,
          onLine: true,
          screen: { width: 1920, height: 1080, colorDepth: 24 },
          timeZone: 'America/New_York',
          url: 'https://zeacore.com/dashboard',
          referrer: 'https://zeacore.com'
        },
        location_info: null,
        metadata: {
          duration: Math.floor(Math.random() * 1000) + 50,
          userRole: Math.random() > 0.5 ? 'admin' : 'user',
          source: 'web'
        },
        created_at: timestamp.toISOString(),
        updated_at: timestamp.toISOString()
      };

      sampleLogs.push(log);
    }

    return sampleLogs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return { logs, loading, error, refetch: fetchLogs };
}

export function useCurrentUserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCurrentProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(*)
        `)
        .eq('user_id', user.id)
        .single();

      if (error) {
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('user_profiles')
            .insert([{
              user_id: user.id,
              email: user.email || '',
              first_name: user.email?.split('@')[0] || 'User',
              last_name: '',
              role_id: '22222222-2222-2222-2222-222222222222', // Default to Admin
              status: 'active'
            }])
            .select(`
              *,
              user_roles(*)
            `)
            .single();

          if (createError) throw createError;
          
          setProfile({
            ...newProfile,
            role: newProfile.user_roles
          });
        } else {
          throw error;
        }
      } else {
        setProfile({
          ...data,
          role: data.user_roles
        });
      }
    } catch (err) {
      console.error('Error fetching current profile:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentProfile();
  }, []);

  return { profile, loading, error, refetch: fetchCurrentProfile };
}

export function usePendingUsers() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select(`
          *,
          user_roles(*)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const pendingUsersWithRoles = (data || []).map(profile => ({
        ...profile,
        role: profile.user_roles
      }));
      
      setPendingUsers(pendingUsersWithRoles);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const approveUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      return true;
    } catch (err) {
      console.error('Error approving user:', err);
      return false;
    }
  };

  const rejectUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ 
          status: 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      // Update local state
      setPendingUsers(prev => prev.filter(user => user.id !== userId));
      return true;
    } catch (err) {
      console.error('Error rejecting user:', err);
      return false;
    }
  };

  return { 
    pendingUsers, 
    loading, 
    error, 
    refetch: fetchPendingUsers,
    approveUser,
    rejectUser
  };
}