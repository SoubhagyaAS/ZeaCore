import React, { useState } from 'react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Briefcase, 
  Shield, 
  Calendar,
  Edit,
  Save,
  X,
  Eye,
  EyeOff,
  Lock,
  Loader2,
  Upload,
  CheckCircle
} from 'lucide-react';
import { useCurrentUserProfile } from '../hooks/useUserManagement';
import { supabase } from '../lib/supabase';
import Avatar from './common/Avatar';
import ImageUpload from './common/ImageUpload';
import { useToast } from '../context/ToastContext';

interface UserProfileProps {
  onBack: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onBack }) => {
  const { profile, loading, refetch } = useCurrentUserProfile();
  const { showToast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const [editData, setEditData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    job_title: '',
    avatar_url: null as string | null
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  React.useEffect(() => {
    if (profile) {
      setEditData({
        first_name: profile.first_name || '',
        last_name: profile.last_name || '',
        phone: profile.phone || '',
        department: profile.department || '',
        job_title: profile.job_title || '',
        avatar_url: profile.avatar_url || null
      });
    }
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <User className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">Profile not found</h3>
        <p className="text-charcoal-light">Unable to load your profile information</p>
        <button onClick={onBack} className="btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset form data
    setEditData({
      first_name: profile.first_name || '',
      last_name: profile.last_name || '',
      phone: profile.phone || '',
      department: profile.department || '',
      job_title: profile.job_title || '',
      avatar_url: profile.avatar_url || null
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...editData,
          updated_at: new Date().toISOString()
        })
        .eq('id', profile.id);

      if (error) throw error;

      await refetch();
      showToast('Profile updated successfully!', 'success');
      setIsEditing(false);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    try {
      // Validate passwords match
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        const errorMsg = 'New passwords do not match';
        setPasswordError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      // Validate password strength
      if (passwordData.newPassword.length < 6) {
        const errorMsg = 'Password must be at least 6 characters long';
        setPasswordError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      // Validate old password is provided
      if (!passwordData.oldPassword) {
        const errorMsg = 'Please enter your current password';
        setPasswordError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      // First verify the old password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: passwordData.oldPassword
      });

      if (signInError) {
        const errorMsg = 'Current password is incorrect';
        setPasswordError(errorMsg);
        showToast(errorMsg, 'error');
        return;
      }

      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;

      showToast('Password updated successfully!', 'success');
      setPasswordSuccess(true);
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide form after success
      setTimeout(() => {
        setShowPasswordForm(false);
        setPasswordSuccess(false);
      }, 2000);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setPasswordError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handlePasswordCancel = () => {
    setShowPasswordForm(false);
    setPasswordError(null);
    setPasswordSuccess(false);
    setPasswordData({
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleAvatarChange = (avatarUrl: string | null) => {
    setEditData(prev => ({
      ...prev,
      avatar_url: avatarUrl
    }));
  };

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-xl transition-all"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-charcoal mb-2">My Profile</h1>
            <p className="text-charcoal-light text-lg">Manage your personal information and account settings</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isEditing ? (
            <>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="btn-secondary flex items-center"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </button>
              <button
                onClick={handleEdit}
                className="btn-primary flex items-center"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-6 py-3 border border-light-gray rounded-xl text-charcoal hover:bg-light-gray transition-colors font-medium"
              >
                <X className="h-4 w-4 mr-2 inline" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary flex items-center"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="card p-6">
          <div className="text-center">
            {isEditing ? (
              <div className="mb-6">
                <div className="flex justify-center mb-4">
                  <ImageUpload
                    currentImage={editData.avatar_url}
                    onImageChange={handleAvatarChange}
                    placeholder="Profile Picture"
                    size="lg"
                    shape="circle"
                  />
                </div>
                <p className="text-sm text-charcoal-light">Click to change profile picture</p>
              </div>
            ) : (
              <div className="mb-6">
                <Avatar
                  src={profile.avatar_url}
                  name={`${profile.first_name} ${profile.last_name}`}
                  size="xl"
                  className="mx-auto mb-4"
                />
                <h2 className="text-2xl font-bold text-charcoal">
                  {profile.first_name} {profile.last_name}
                </h2>
                <p className="text-charcoal-light">{profile.job_title || 'No job title set'}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <Mail className="h-4 w-4 text-charcoal-light mr-2" />
                <span className="text-charcoal">{profile.email}</span>
              </div>
              
              {profile.phone && (
                <div className="flex items-center justify-center">
                  <Phone className="h-4 w-4 text-charcoal-light mr-2" />
                  <span className="text-charcoal">{profile.phone}</span>
                </div>
              )}

              <div className="flex items-center justify-center">
                <Calendar className="h-4 w-4 text-charcoal-light mr-2" />
                <span className="text-charcoal">
                  Joined {new Date(profile.created_at).toLocaleDateString()}
                </span>
              </div>

              {profile.role && (
                <div className="flex items-center justify-center">
                  <Shield className="h-4 w-4 text-charcoal-light mr-2" />
                  <span className="px-3 py-1 bg-royal-blue text-soft-white text-sm rounded-full font-medium">
                    {profile.role.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  First Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="first_name"
                    value={editData.first_name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter first name"
                  />
                ) : (
                  <p className="text-charcoal bg-light-gray p-3 rounded-xl">
                    {profile.first_name || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Last Name
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="last_name"
                    value={editData.last_name}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter last name"
                  />
                ) : (
                  <p className="text-charcoal bg-light-gray p-3 rounded-xl">
                    {profile.last_name || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email Address
                </label>
                <p className="text-charcoal bg-light-gray p-3 rounded-xl">
                  {profile.email}
                  <span className="text-xs text-charcoal-light ml-2">(Cannot be changed)</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Phone Number
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    value={editData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter phone number"
                  />
                ) : (
                  <p className="text-charcoal bg-light-gray p-3 rounded-xl">
                    {profile.phone || 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-6">Work Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Building className="h-4 w-4 inline mr-1" />
                  Department
                </label>
                {isEditing ? (
                  <select
                    name="department"
                    value={editData.department}
                    onChange={handleInputChange}
                    className="input-field"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                ) : (
                  <p className="text-charcoal bg-light-gray p-3 rounded-xl">
                    {profile.department || 'Not set'}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Briefcase className="h-4 w-4 inline mr-1" />
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="job_title"
                    value={editData.job_title}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Enter job title"
                  />
                ) : (
                  <p className="text-charcoal bg-light-gray p-3 rounded-xl">
                    {profile.job_title || 'Not set'}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Role & Permissions
                </label>
                <div className="bg-light-gray p-4 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-charcoal">
                        {profile.role?.name || 'No role assigned'}
                      </p>
                      <p className="text-sm text-charcoal-light">
                        {profile.role?.description || 'No description available'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 bg-royal-blue text-soft-white text-sm rounded-full font-medium">
                        Level {profile.role?.level || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Form */}
      {showPasswordForm && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-charcoal">Change Password</h3>
              <p className="text-charcoal-light">Update your account password</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                <p className="text-green-800 text-sm font-medium">Password updated successfully!</p>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showOldPassword ? 'text' : 'password'}
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordInputChange}
                    required
                    className="input-field pr-12"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-light hover:text-charcoal"
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordInputChange}
                    required
                    minLength={6}
                    className="input-field pr-12"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-light hover:text-charcoal"
                  >
                    {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-charcoal-light mt-1">Minimum 6 characters</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordInputChange}
                    required
                    className="input-field pr-12"
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-charcoal-light hover:text-charcoal"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-800 text-sm">{passwordError}</p>
              </div>
            )}

            <div className="flex justify-end space-x-4">
              <button
                onClick={handlePasswordCancel}
                className="px-6 py-3 border border-light-gray rounded-xl text-charcoal hover:bg-light-gray transition-colors font-medium"
              >
                <X className="h-4 w-4 mr-2 inline" />
                Cancel
              </button>
              <button
                onClick={handlePasswordSave}
                disabled={passwordLoading}
                className="btn-primary flex items-center"
              >
                {passwordLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Password
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;