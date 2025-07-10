import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { secureStorage } from '../lib/secureStorage';

interface AuthState {
  isAuthenticated: boolean;
  user: any;
  loading: boolean;
}

interface LoginAttempt {
  timestamp: number;
  success: boolean;
}

export function useSecureAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  // Track login attempts for security
  const trackLoginAttempt = (success: boolean) => {
    const attempts = secureStorage.getItem<LoginAttempt[]>('loginAttempts') || [];
    const newAttempt: LoginAttempt = {
      timestamp: Date.now(),
      success
    };

    // Keep only attempts from the last hour
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentAttempts = attempts.filter(attempt => attempt.timestamp > oneHourAgo);
    recentAttempts.push(newAttempt);

    secureStorage.setItem('loginAttempts', recentAttempts, {
      expiry: 60 * 60 * 1000 // 1 hour
    });
  };

  // Check if user has too many failed login attempts
  const isAccountLocked = (): boolean => {
    const attempts = secureStorage.getItem<LoginAttempt[]>('loginAttempts') || [];
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const recentFailedAttempts = attempts.filter(
      attempt => attempt.timestamp > oneHourAgo && !attempt.success
    );

    return recentFailedAttempts.length >= 5; // Lock after 5 failed attempts
  };

  // Get time until account unlock
  const getUnlockTime = (): number => {
    const attempts = secureStorage.getItem<LoginAttempt[]>('loginAttempts') || [];
    const failedAttempts = attempts.filter(attempt => !attempt.success);
    
    if (failedAttempts.length === 0) return 0;
    
    const oldestFailedAttempt = Math.min(...failedAttempts.map(a => a.timestamp));
    const unlockTime = oldestFailedAttempt + (60 * 60 * 1000); // 1 hour from first failed attempt
    
    return Math.max(0, unlockTime - Date.now());
  };

  // Enhanced login with security features
  const secureLogin = async (email: string, password: string, rememberMe: boolean = false) => {
    if (isAccountLocked()) {
      const unlockTime = getUnlockTime();
      const minutes = Math.ceil(unlockTime / (60 * 1000));
      throw new Error(`Account temporarily locked. Try again in ${minutes} minutes.`);
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.toLowerCase().trim(),
        password
      });

      if (error) {
        trackLoginAttempt(false);
        throw error;
      }

      // Successful login
      trackLoginAttempt(true);
      
      // Handle remember me
      if (rememberMe) {
        secureStorage.storeLoginCredentials(email, true);
      } else {
        secureStorage.clearLoginCredentials();
      }

      // Store last login time
      secureStorage.setItem('lastLoginTime', Date.now(), {
        encrypt: true,
        expiry: 30 * 24 * 60 * 60 * 1000 // 30 days
      });

      return data;
    } catch (error) {
      trackLoginAttempt(false);
      throw error;
    }
  };

  // Secure logout
  const secureLogout = async () => {
    try {
      await supabase.auth.signOut();
      
      // Clear sensitive data but keep remember me if enabled
      const { rememberMe } = secureStorage.getLoginCredentials();
      if (!rememberMe) {
        secureStorage.clearLoginCredentials();
      }
      
      // Clear other sensitive session data
      secureStorage.removeItem('lastLoginTime');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Check session validity
  const validateSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Session validation error:', error);
        await secureLogout();
        return false;
      }

      if (!session) {
        await secureLogout();
        return false;
      }

      // Check if session is expired
      const now = Date.now() / 1000;
      if (session.expires_at && session.expires_at < now) {
        await secureLogout();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      await secureLogout();
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const isValid = await validateSession();
        
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      } catch (error) {
        console.error('Auth initialization error:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false
        });
      } else if (event === 'SIGNED_IN' && session) {
        setAuthState({
          isAuthenticated: true,
          user: session.user,
          loading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    ...authState,
    secureLogin,
    secureLogout,
    isAccountLocked: isAccountLocked(),
    unlockTime: getUnlockTime(),
    validateSession
  };
}