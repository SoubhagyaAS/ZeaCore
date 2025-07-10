import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, Briefcase, Shield, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUserRoles } from '../../hooks/useUserManagement';
import { useToast } from '../../context/ToastContext';
import ImageUpload from '../common/ImageUpload';

interface EditUserFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user: any;
}

const EditUserForm: React.FC<EditUserFormProps> = ({ isOpen, onClose, onSuccess, user }) => {
  const { roles } = useUserRoles();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    department: '',
    job_title: '',
    role_id: '',
    status: 'active',
    avatar_url: null as string | null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        phone: user.phone || '',
        department: user.department || '',
        job_title: user.job_title || '',
        role_id: user.role_id || '',
        status: user.status || 'active',
        avatar_url: user.avatar_url || null
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      onSuccess();
      showToast('User updated successfully!', 'success');
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMsg);
      showToast(errorMsg, 'error');
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

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Edit User</h2>
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

          {/* User Info Display */}
          <div className="bg-light-gray rounded-xl p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-royal-blue to-sky-blue flex items-center justify-center mr-4">
                <span className="text-soft-white font-medium">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <div>
                <h3 className="font-semibold text-charcoal">{user.first_name} {user.last_name}</h3>
                <p className="text-charcoal-light">{user.email}</p>
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
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
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
                'Update User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserForm;