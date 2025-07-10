import React, { useState } from 'react';
import { Shield, Plus, Edit, Trash2, Users, Lock, Unlock, Loader2 } from 'lucide-react';
import { useUserRoles } from '../hooks/useUserManagement';
import AddRoleForm from './forms/AddRoleForm';
import EditRoleForm from './forms/EditRoleForm';

const RoleManagement: React.FC = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const { roles, loading, error, refetch } = useUserRoles();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading roles...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading roles: {error}</p>
      </div>
    );
  }

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1: return 'from-purple-500 to-purple-600';
      case 2: return 'from-blue-500 to-blue-600';
      case 3: return 'from-green-500 to-green-600';
      case 4: return 'from-gray-500 to-gray-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getLevelName = (level: number) => {
    switch (level) {
      case 1: return 'Super Admin';
      case 2: return 'Admin';
      case 3: return 'Manager';
      case 4: return 'User';
      default: return 'Unknown';
    }
  };

  const handleAddSuccess = () => {
    refetch();
  };

  const handleEditRole = (role: any) => {
    setSelectedRole(role);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setShowEditForm(false);
    setSelectedRole(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal">Roles & Permissions</h2>
          <p className="text-charcoal-light">Define user roles and their access permissions</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Role
        </button>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {roles.map((role) => (
          <div key={role.id} className="card p-6 hover:shadow-2xl transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-br ${getLevelColor(role.level)}`}>
                <Shield className="h-6 w-6 text-soft-white" />
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditRole(role)}
                  className="p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-lg transition-all"
                  title="Edit Role"
                >
                  <Edit className="h-4 w-4" />
                </button>
                {role.level > 1 && (
                  <button className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h3 className="text-xl font-bold text-charcoal mb-1">{role.name}</h3>
              <p className="text-sm text-charcoal-light mb-2">{role.description}</p>
              <div className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                role.level === 1 ? 'bg-purple-100 text-purple-800' :
                role.level === 2 ? 'bg-blue-100 text-blue-800' :
                role.level === 3 ? 'bg-green-100 text-green-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                Level {role.level} - {getLevelName(role.level)}
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-charcoal mb-3">Permissions</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {role.permissions && role.permissions.length > 0 ? (
                  role.permissions.slice(0, 4).map((permission: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-light-gray rounded-lg">
                      <span className="text-sm text-charcoal font-medium">{permission.resource}</span>
                      <div className="flex space-x-1">
                        {permission.actions.map((action: string, actionIndex: number) => (
                          <span key={actionIndex} className="text-xs bg-sky-blue bg-opacity-20 text-royal-blue px-2 py-1 rounded-full">
                            {action}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-charcoal-light">No specific permissions defined</p>
                )}
                {role.permissions && role.permissions.length > 4 && (
                  <p className="text-xs text-charcoal-light">+{role.permissions.length - 4} more permissions</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-light-gray">
              <div className="flex items-center text-sm text-charcoal-light">
                <Users className="h-4 w-4 mr-1" />
                <span>0 users</span> {/* This would be calculated from user_profiles */}
              </div>
              <div className="flex items-center text-sm">
                {role.level <= 2 ? (
                  <div className="flex items-center text-green-600">
                    <Unlock className="h-4 w-4 mr-1" />
                    <span>Full Access</span>
                  </div>
                ) : (
                  <div className="flex items-center text-orange-600">
                    <Lock className="h-4 w-4 mr-1" />
                    <span>Limited Access</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {roles.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-charcoal-light" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">No roles found</h3>
          <p className="text-charcoal-light">Create your first role to get started</p>
        </div>
      )}

      <AddRoleForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />

      <EditRoleForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedRole(null);
        }}
        onSuccess={handleEditSuccess}
        role={selectedRole}
      />
    </div>
  );
};

export default RoleManagement;