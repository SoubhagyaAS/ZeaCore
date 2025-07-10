import React, { useState } from 'react';
import { X, User, Mail, Phone, Building, Briefcase, Shield, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUserRoles } from '../../hooks/useUserManagement';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../common/ImageUpload';

interface AddUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { roles } = useUserRoles();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    job_title: '',
    role_id: '',
    status: 'pending', // Default to pending for approval
    avatar_url: null as string | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const departments = [
    'Engineering',
    'Sales',
    'Marketing',
    'Customer Success',
    'Finance',
    'Human Resources',
    'Operations',
    'Product',
    'Legal',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebugInfo('Starting user creation...');

    try {
      console.log('=== CLIENT-SIDE USER CREATION STARTED ===');
      setDebugInfo('Validating input...');

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        const errorMsg = 'Please enter a valid email address';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      // Validate password strength
      if (formData.password.length < 6) {
        const errorMsg = 'Password must be at least 6 characters long';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      // Normalize email
      const normalizedEmail = formData.email.toLowerCase().trim();
      console.log('Normalized email:', normalizedEmail);
      setDebugInfo(`Checking for existing users with email: ${normalizedEmail}`);

      // Check if email already exists in user_profiles first (client-side check)
      const { data: existingProfiles, error: checkError } = await supabase
        .from('user_profiles')
        .select('email')
        .ilike('email', normalizedEmail);

      if (checkError) {
        console.error('Error checking existing profiles:', checkError);
        const errorMsg = 'Error checking existing users';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        setDebugInfo(`Error checking profiles: ${checkError.message}`);
        return;
      }

      if (existingProfiles && existingProfiles.length > 0) {
        console.log('Profile already exists');
        const errorMsg = 'A user with this email already exists';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        setDebugInfo('Profile already exists in database');
        return;
      }

      setDebugInfo('Getting authentication session...');

      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const errorMsg = 'No active session. Please refresh and try again.';
        setError(errorMsg);
        showToast(errorMsg, 'error');
        setDebugInfo('No active session found');
        return;
      }

      setDebugInfo('Calling create-user function...');

      // Call the Edge Function to create user
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`;
      console.log('Function URL:', functionUrl);

      const requestBody = {
        ...formData,
        email: normalizedEmail,
        company: formData.company || 'Default Company' // Add company field for consistency
      };

      console.log('Request body:', { ...requestBody, password: '[REDACTED]' });

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      setDebugInfo(`Function response status: ${response.status}`);
      
      const result = await response.json();
      console.log('Response result:', result);

      if (!response.ok) {
        // Only log console error for unexpected errors, not validation errors
        const isValidationError = result.error && (
          result.error.includes('already exists') ||
          response.status === 409
        );
        
        if (!isValidationError) {
          console.error('Function call failed:', result);
        }
        
        setDebugInfo(`Function failed: ${result.error || 'Unknown error'}`);
        
        // Handle specific error cases
        if (response.status === 409) {
          const errorMsg = 'A user with this email was just created. Please try again in a moment.';
          setError(errorMsg);
          showToast(errorMsg, 'error');
        } else if (result.error && result.error.includes('already exists')) {
          const errorMsg = 'A user with this email already exists';
          setError(errorMsg);
          showToast(errorMsg, 'error');
        } else if (result.error && result.error.includes('configuration')) {
          const errorMsg = 'Server configuration error. Please contact support.';
          setError(errorMsg);
          showToast(errorMsg, 'error');
        } else {
          const errorMsg = result.error || 'Failed to create user';
          setError(errorMsg);
          showToast(errorMsg, 'error');
        }
        return;
      }

      console.log('User created successfully');
      setDebugInfo('User created successfully!');

      showToast('User created successfully! Awaiting approval.', 'success');

      // Reset form
      setFormData({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        department: '',
        job_title: '',
        role_id: '',
        status: 'pending',
        avatar_url: null
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMsg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMsg);
      showToast(errorMsg, 'error');
      setDebugInfo(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      avatar_url: avatarUrl
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Add New User</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Picture */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-4">
              <Upload className="h-4 w-4 inline mr-1" />
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <ImageUpload
                currentImage={formData.avatar_url}
                onImageChange={handleAvatarChange}
                placeholder="Profile Picture"
                size="lg"
                shape="circle"
              />
              <div className="text-sm text-charcoal-light">
                <p>Upload profile picture</p>
                <p className="text-xs">Recommended: 256x256px, PNG or JPG</p>
              </div>
            </div>
          </div>

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="John"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="john.doe@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => {
                    // Only allow Level 1 and 2 users to set status directly
                    const currentUserLevel = userProfile?.role?.level || 4;
                    if (currentUserLevel <= 2) {
                      handleChange(e);
                    }
                  }}
                  className="input-field"
                  disabled={userProfile?.role?.level > 2} // Disable for non-admin users
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending Approval</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
                {userProfile?.role?.level > 2 && (
                  <p className="text-xs text-charcoal-light mt-1">
                    New users require approval from an administrator
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-4">Work Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Job Title
                </label>
                <input
                  type="text"
                  name="job_title"
                  value={formData.job_title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Software Engineer"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Role
                </label>
                <select
                  name="role_id"
                  value={formData.role_id}
                  onChange={handleChange}
                  required
                  className="input-field"
                >
                  <option value="">Select Role</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>
                      {role.name} - Level {role.level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Debug Information */}
          {debugInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-blue-800 text-sm font-medium">Debug Info:</p>
              <p className="text-blue-700 text-sm">{debugInfo}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-light-gray rounded-xl text-charcoal hover:bg-light-gray transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserForm;