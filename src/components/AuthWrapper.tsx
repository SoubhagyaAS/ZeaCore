import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';
import { Loader2, LogIn, Package, Bell, User as UserIcon, Settings, LogOut, Shield } from 'lucide-react';
import { useCurrentUserProfile } from '../hooks/useUserManagement';
import { usePendingUsers } from '../hooks/useUserManagement'; 
import Avatar from './common/Avatar';
import { secureStorage } from '../lib/secureStorage';
import ZeaCoreLogo from './logos/ZeaCoreLogo';
import { useToast } from '../context/ToastContext';
import { accessLogger } from '../lib/accessLogger';

interface AuthWrapperProps {
  children: React.ReactNode;
  onProfileClick?: () => void;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children, onProfileClick }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    company: ''
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Get current user profile and pending users count
  const { profile: userProfile } = useCurrentUserProfile();
  const { pendingUsers, loading: pendingLoading } = usePendingUsers();
  const { showToast } = useToast();

  // Load saved credentials on component mount
  useEffect(() => {
    const { email: savedEmail, rememberMe: rememberMeEnabled } = secureStorage.getLoginCredentials();
    
    if (savedEmail && rememberMeEnabled) {
      setFormData(prev => ({ ...prev, email: savedEmail }));
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        accessLogger.logLogin(session.user.id, { method: 'session_restore' });
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      
      // Log auth events
      if (event === 'SIGNED_IN' && session?.user) {
        accessLogger.logLogin(session.user.id, { method: 'password' });
      } else if (event === 'SIGNED_OUT') {
        accessLogger.logLogout();
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.profile-menu') && !target.closest('.notification-menu')) {
        setShowProfileMenu(false);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Validate required fields for sign up
        if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.company.trim()) {
          setError('Please fill in all required fields');
          setAuthLoading(false);
          return;
        }

        const { error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              first_name: formData.firstName.trim(),
              last_name: formData.lastName.trim(),
              company: formData.company.trim(),
              // Remove status from user metadata as it should be handled in user_profiles table
            }
          }
        });
        if (error) throw error;
        
        // Show success message for signup
        showToast('Account created successfully! Please check your email to verify your account before signing in.', 'success');
        setIsSignUp(false);
        setFormData({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          company: ''
        });
        setAuthLoading(false);
        return;
      } else {
        // Check if user exists and is verified before attempting sign in
        // Handle remember me functionality
        if (rememberMe) {
          secureStorage.storeLoginCredentials(formData.email, true);
        } else {
          secureStorage.clearLoginCredentials();
        }

        const { error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) {
          // Log failed login attempt
          accessLogger.logSecurityEvent('failed_login', { 
            email: formData.email, 
            reason: error.message 
          });
          
          // Provide more specific error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please check your email and click the verification link before signing in.');
          } else if (error.message.includes('Too many requests')) {
            throw new Error('Too many login attempts. Please wait a few minutes before trying again.');
          } else {
            throw error;
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSignOut = async () => {
    if (user) {
      accessLogger.logLogout(user.id, { method: 'manual_logout' });
    }
    await supabase.auth.signOut();
    setShowProfileMenu(false);
  };

  const handleProfileClick = () => {
    setShowProfileMenu(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  // Mock notifications data
  const notifications = [
    ...(pendingUsers.length > 0 ? [{
      id: 'pending-users',
      title: 'User Approval Required',
      message: `${pendingUsers.length} user${pendingUsers.length > 1 ? 's' : ''} pending approval`,
      time: 'Just now',
      unread: true,
      type: 'approval'
    }] : []),
    { id: 1, title: 'New subscription', message: 'TechCorp Solutions upgraded to Pro plan', time: '2 min ago', unread: true },
    { id: 2, title: 'Payment received', message: '$149 payment from CloudTech Systems', time: '15 min ago', unread: true },
    { id: 3, title: 'Trial expiring', message: 'Innovate Labs trial ends in 3 days', time: '1 hour ago', unread: false },
    { id: 4, title: 'System update', message: 'Maintenance scheduled for tonight', time: '2 hours ago', unread: false },
  ];

  const unreadCount = notifications.filter(n => n.unread).length + (pendingUsers.length > 0 ? 1 : 0);

  // Get display name - prefer profile first name, fallback to email username
  const getDisplayName = () => {
    // Priority: userProfile.first_name > user metadata > email username
    return userProfile?.first_name || 
           user?.user_metadata?.first_name || 
           user?.raw_user_meta_data?.first_name || 
           user?.email?.split('@')[0] || 
           'User';
  };

  // Get full display name for profile display
  const getFullDisplayName = () => {
    // Priority: userProfile full name > user metadata full name > first name only
    const firstName = userProfile?.first_name || user?.user_metadata?.first_name || user?.raw_user_meta_data?.first_name;
    const lastName = userProfile?.last_name || user?.user_metadata?.last_name || user?.raw_user_meta_data?.last_name;
    
    return firstName && lastName ? `${firstName} ${lastName}`.trim() : getDisplayName();
  };
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-light-gray to-soft-white">
        <div className="flex items-center bg-soft-white p-8 rounded-2xl shadow-xl">
          <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
          <span className="ml-3 text-charcoal font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-royal-blue via-sky-blue to-bright-cyan">
        <div className="max-w-md w-full mx-4">
          <div className="bg-soft-white rounded-3xl shadow-2xl p-8">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-6">
                <ZeaCoreLogo 
                  size="lg" 
                  variant="vertical" 
                  showTagline={true}
                  className="text-charcoal"
                />
              </div>
              <h2 className="text-3xl font-bold text-charcoal mb-2">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </h2>
              <p className="text-charcoal-light">
                {isSignUp ? 'Join the ZeaCore Platform' : 'Sign in to your account'}
              </p>
            </div>
            
            <form className="space-y-6" onSubmit={handleAuth}>
              {isSignUp && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <input
                        type="text"
                        name="firstName"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="First Name"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        name="lastName"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Last Name"
                      />
                    </div>
                  </div>
                  <div>
                    <input
                      type="text"
                      name="company"
                      required
                      value={formData.company}
                      onChange={handleInputChange}
                      className="input-field"
                      placeholder="Company Name"
                    />
                  </div>
                </>
              )}
              <div>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Email address"
                />
              </div>
              <div>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Password"
                />
              </div>

              {!isSignUp && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 text-royal-blue focus:ring-sky-blue border-light-gray rounded"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-sm text-charcoal">
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    <button
                      type="button"
                      className="text-royal-blue hover:text-sky-blue font-medium transition-colors"
                      onClick={() => {
                        // You can implement forgot password functionality here
                        alert('Forgot password functionality can be implemented here');
                      }}
                    >
                      Forgot your password?
                    </button>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={authLoading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {authLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    {isSignUp ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormData({
                      email: rememberMe ? formData.email : '', // Keep email if remembered
                      password: '',
                      firstName: '',
                      lastName: '',
                      company: ''
                    });
                    setError(null);
                  }}
                  className="text-royal-blue hover:text-sky-blue font-medium transition-colors"
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Enhanced Header with Larger Logo and User First Name */}
      <div className="bg-charcoal border-b border-charcoal-light px-6 py-4 shadow-sm">
        <div className="flex justify-between items-center">
          {/* Larger Logo and Product Name on Left */}
          <div className="flex items-center">
            <ZeaCoreLogo 
              size="lg" 
              variant="horizontal" 
              showTagline={false}
              className="text-soft-white"
            />
          </div>

          {/* User Controls on Right */}
          <div className="flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative notification-menu">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setShowProfileMenu(false);
                }}
                className="relative p-2 text-gray-300 hover:text-soft-white hover:bg-charcoal-light rounded-xl transition-all duration-200"
              >
                <Bell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-soft-white rounded-xl shadow-2xl border border-light-gray z-50">
                  <div className="p-4 border-b border-light-gray">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-charcoal">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="bg-royal-blue text-soft-white text-xs px-2 py-1 rounded-full font-medium">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-light-gray hover:bg-sky-blue hover:bg-opacity-5 transition-colors cursor-pointer ${
                          notification.unread ? 'bg-sky-blue bg-opacity-5' : ''
                        }`}
                        onClick={() => {
                          if (notification.type === 'approval') {
                            setShowNotifications(false);
                            if (onTabChange) {
                              onTabChange('users');
                            }
                          }
                        }}
                      >
                        <div className="flex items-start">
                          <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                            notification.unread ? 'bg-royal-blue' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-charcoal text-sm">{notification.title}</h4>
                            <p className="text-charcoal-light text-sm mt-1">{notification.message}</p>
                            <p className="text-xs text-charcoal-light mt-2">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 border-t border-light-gray">
                    <button className="w-full text-center text-royal-blue hover:text-sky-blue font-medium text-sm transition-colors">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Menu with First Name and Avatar */}
            <div className="relative profile-menu">
              <button
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center p-2 text-gray-300 hover:text-soft-white hover:bg-charcoal-light rounded-xl transition-all duration-200"
              >
                <Avatar
                  src={userProfile?.avatar_url}
                  name={getFullDisplayName()}
                  size="sm"
                  className="mr-3"
                />
                <span className="text-sm font-medium text-soft-white hidden sm:block">
                  {getDisplayName()}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-soft-white rounded-xl shadow-2xl border border-light-gray z-50">
                  <div className="p-4 border-b border-light-gray">
                    <div className="flex items-center">
                      <Avatar
                        src={userProfile?.avatar_url}
                        name={getFullDisplayName()}
                        size="md"
                        className="mr-3"
                      />
                      <div>
                        <p className="font-medium text-charcoal text-sm">
                          {getFullDisplayName()}
                        </p>
                        <p className="text-xs text-charcoal-light">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="py-2">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full flex items-center px-4 py-3 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 transition-all text-left"
                    >
                      <UserIcon className="h-4 w-4 mr-3" />
                      <span className="text-sm font-medium">Profile</span>
                    </button>
                    
                    <button className="w-full flex items-center px-4 py-3 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 transition-all text-left">
                      <Shield className="h-4 w-4 mr-3" />
                      <span className="text-sm font-medium">Role</span>
                      <span className="ml-auto text-xs bg-royal-blue text-soft-white px-2 py-1 rounded-full">
                        {userProfile?.role?.name || 'Admin'}
                      </span>
                    </button>
                    
                    <button className="w-full flex items-center px-4 py-3 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 transition-all text-left">
                      <Settings className="h-4 w-4 mr-3" />
                      <span className="text-sm font-medium">Settings</span>
                    </button>
                  </div>
                  
                  <div className="border-t border-light-gray py-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all text-left"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      <span className="text-sm font-medium">Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export default AuthWrapper;