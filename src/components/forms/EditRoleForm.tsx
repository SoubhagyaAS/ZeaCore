import React, { useState, useEffect } from 'react';
import { X, Shield, Plus, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { accessLogger } from '../../lib/accessLogger';

interface EditRoleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role: any;
}

const EditRoleForm: React.FC<EditRoleFormProps> = ({ isOpen, onClose, onSuccess, role }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    level: 4
  });
  const [permissions, setPermissions] = useState([
    { resource: '', actions: [''] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resources = [
    'users', 'roles', 'apps', 'customers', 'subscriptions', 
    'plans', 'analytics', 'settings', 'features', 'payments'
  ];

  const actions = ['create', 'read', 'update', 'delete'];

  // Initialize form data when role changes
  useEffect(() => {
    if (role) {
      setFormData({
        name: role.name || '',
        description: role.description || '',
        level: role.level || 4
      });
      
      if (role.permissions && role.permissions.length > 0) {
        setPermissions(role.permissions.map((perm: any) => ({
          resource: perm.resource || '',
          actions: perm.actions || ['']
        })));
      } else {
        setPermissions([{ resource: '', actions: [''] }]);
      }
    }
  }, [role]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const validPermissions = permissions.filter(p => 
        p.resource && p.actions.some(a => a)
      ).map(p => ({
        resource: p.resource,
        actions: p.actions.filter(a => a)
      }));

      const { error } = await supabase
        .from('user_roles')
        .update({
          ...formData,
          permissions: validPermissions,
          updated_at: new Date().toISOString()
        })
        .eq('id', role.id);

      if (error) throw error;

      // Log the role update
      await accessLogger.logUpdate('user_roles', role.id, role.name);

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const addPermission = () => {
    setPermissions([...permissions, { resource: '', actions: [''] }]);
  };

  const removePermission = (index: number) => {
    setPermissions(permissions.filter((_, i) => i !== index));
  };

  const updatePermission = (index: number, field: string, value: string) => {
    const updated = [...permissions];
    if (field === 'resource') {
      updated[index].resource = value;
    }
    setPermissions(updated);
  };

  const toggleAction = (permIndex: number, action: string) => {
    const updated = [...permissions];
    const actions = updated[permIndex].actions;
    if (actions.includes(action)) {
      updated[permIndex].actions = actions.filter(a => a !== action);
    } else {
      updated[permIndex].actions = [...actions.filter(a => a), action];
    }
    setPermissions(updated);
  };

  if (!isOpen || !role) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Edit Role: {role.name}</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Shield className="h-4 w-4 inline mr-1" />
                  Role Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Content Manager"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Access Level
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value={1}>Level 1 - Super Admin</option>
                  <option value={2}>Level 2 - Admin</option>
                  <option value={3}>Level 3 - Manager</option>
                  <option value={4}>Level 4 - User</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="input-field"
                  placeholder="Describe the role's responsibilities and scope"
                />
              </div>
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Permissions</h3>
              <button
                type="button"
                onClick={addPermission}
                className="btn-secondary flex items-center text-sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Permission
              </button>
            </div>

            <div className="space-y-4">
              {permissions.map((permission, index) => (
                <div key={index} className="bg-light-gray rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-charcoal">Permission {index + 1}</h4>
                    {permissions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePermission(index)}
                        className="text-red-600 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Resource
                      </label>
                      <select
                        value={permission.resource}
                        onChange={(e) => updatePermission(index, 'resource', e.target.value)}
                        className="input-field"
                      >
                        <option value="">Select Resource</option>
                        {resources.map(resource => (
                          <option key={resource} value={resource}>
                            {resource.charAt(0).toUpperCase() + resource.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-charcoal mb-2">
                        Actions
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {actions.map(action => (
                          <label key={action} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={permission.actions.includes(action)}
                              onChange={() => toggleAction(index, action)}
                              className="mr-2"
                            />
                            <span className="text-sm text-charcoal capitalize">{action}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-light-gray">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Update Role
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditRoleForm; 