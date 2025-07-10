import React, { useState } from 'react';
import { Users, UserPlus, Shield, Activity, Search, Filter, Eye, Edit, Loader2, RefreshCw, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { useUserProfiles, useUserRoles, usePendingUsers } from '../hooks/useUserManagement';
import AddUserForm from './forms/AddUserForm';
import EditUserForm from './forms/EditUserForm';
import { useToast } from '../context/ToastContext';
import RoleManagement from './RoleManagement';
import AccessLogsView from './AccessLogsView';
import Avatar from './common/Avatar';
import StatusIcon from './common/StatusIcon';

const UserManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const { profiles, loading: profilesLoading, error: profilesError, refetch: refetchProfiles } = useUserProfiles();
  const { pendingUsers, loading: pendingLoading, error: pendingError, approveUser, rejectUser, refetch: refetchPending } = usePendingUsers();
  const { showToast } = useToast();
  const { roles } = useUserRoles();

  const loading = profilesLoading || pendingLoading;
  const error = profilesError || pendingError;

  if (loading && !profiles.length && !pendingUsers.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading user management...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Users</h3>
            <p className="text-red-700">{profilesError || pendingError}</p>
          </div>
          <button
            onClick={() => {
              refetchProfiles();
              refetchPending();
            }}
            className="btn-primary flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Combine active profiles with pending users for filtering
  const activeProfiles = profiles.filter(profile => profile.status !== 'pending' && profile.status !== 'rejected');
  
  const filteredProfiles = activeProfiles.filter(profile => {
    const matchesSearch = 
      profile.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      profile.job_title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || profile.status === statusFilter;
    const matchesRole = roleFilter === 'all' || profile.role_id === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const getRoleBadgeColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-purple-100 text-purple-800';
      case 2: return 'bg-blue-100 text-blue-800';
      case 3: return 'bg-green-100 text-green-800';
      case 4: return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setShowEditForm(true);
  };
  
  const handleApproveUser = async (userId: string) => {
    const success = await approveUser(userId);
    if (success) {
      showToast('User approved successfully!', 'success');
      refetchProfiles();
      refetchPending();
    }
  };
  
  const handleRejectUser = async (userId: string) => {
    if (confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      const success = await rejectUser(userId);
      if (success) {
        showToast('User rejected.', 'warning');
        refetchPending();
      }
    }
  };

  const handleAddSuccess = () => {
    showToast('User added successfully!', 'success');
    refetchProfiles();
    refetchPending();
  };

  const tabs = [
    { id: 'users', label: 'Users', icon: Users },
    { id: 'roles', label: 'Roles & Permissions', icon: Shield },
    { id: 'logs', label: 'Access Logs', icon: Activity }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'roles':
        return <RoleManagement />;
      case 'logs':
        return <AccessLogsView />;
      default:
        return renderUsersTab();
    }
  };

  const renderUsersTab = () => (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Pending Users</p>
              <p className="text-2xl font-bold text-yellow-600">
                {pendingUsers.length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-xl">
              <UserPlus className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Total Users</p>
              <p className="text-2xl font-bold text-charcoal">{activeProfiles.length}</p>
            </div>
            <div className="bg-royal-blue bg-opacity-10 p-3 rounded-xl">
              <Users className="h-6 w-6 text-royal-blue" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Active Users</p>
              <p className="text-2xl font-bold text-green-600">
                {activeProfiles.filter(p => p.status === 'active').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Admins</p>
              <p className="text-2xl font-bold text-purple-600">
                {activeProfiles.filter(p => p.role?.level && p.role.level <= 2).length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <Shield className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-charcoal-light">
              <Filter className="h-4 w-4 mr-2" />
              {filteredProfiles.length} of {activeProfiles.length} users
            </div>
            <button
              onClick={() => {
                refetchProfiles();
                refetchPending();
              }}
              className="p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-lg transition-all"
              title="Refresh"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <UserPlus className="h-5 w-5 text-yellow-600 mr-2" />
            <h3 className="text-xl font-bold text-charcoal">Pending Approval ({pendingUsers.length})</h3>
          </div>
          
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-light-gray">
                <thead className="bg-light-gray">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Requested
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-soft-white divide-y divide-light-gray">
                  {pendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-yellow-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 mr-4">
                            <Avatar
                              src={user.avatar_url}
                              name={`${user.first_name} ${user.last_name}`}
                              size="md"
                            />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-charcoal">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-charcoal-light">{user.email}</div>
                            {user.job_title && (
                              <div className="text-xs text-charcoal-light">{user.job_title}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getRoleBadgeColor(user.role?.level || 4)}`}>
                          {user.role?.name || 'No Role'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                        {user.department || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleApproveUser(user.id)}
                            className="bg-green-100 text-green-800 hover:bg-green-200 p-2 rounded-lg transition-all flex items-center"
                          >
                            <UserCheck className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Approve</span>
                          </button>
                          <button 
                            onClick={() => handleRejectUser(user.id)}
                            className="bg-red-100 text-red-800 hover:bg-red-200 p-2 rounded-lg transition-all flex items-center"
                          >
                            <UserX className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Reject</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-gray">
            <thead className="bg-light-gray">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-soft-white divide-y divide-light-gray">
              {filteredProfiles.map((profile) => (
                <tr key={profile.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 mr-4">
                        <Avatar
                          src={profile.avatar_url}
                          name={`${profile.first_name} ${profile.last_name}`}
                          size="md"
                        />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-charcoal">
                          {profile.first_name} {profile.last_name}
                        </div>
                        <div className="text-sm text-charcoal-light">{profile.email}</div>
                        {profile.job_title && (
                          <div className="text-xs text-charcoal-light">{profile.job_title}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${getRoleBadgeColor(profile.role?.level || 4)}`}>
                      {profile.role?.name || 'No Role'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                    {profile.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIcon 
                      status={profile.status} 
                      type="user" 
                      size="sm"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                    {profile.last_login 
                      ? new Date(profile.last_login).toLocaleDateString()
                      : 'Never'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditUser(profile)}
                        className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredProfiles.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            {pendingUsers.length > 0 ? (
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            ) : (
              <Users className="h-10 w-10 text-charcoal-light" />
            )}
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">
            {pendingUsers.length > 0 ? 'No active users match your criteria' : 'No users found'}
          </h3>
          <p className="text-charcoal-light">
            {activeProfiles.length === 0 && pendingUsers.length === 0
              ? 'No users have been created yet. Add your first user to get started.'
              : pendingUsers.length > 0 && activeProfiles.length === 0
              ? `You have ${pendingUsers.length} pending user${pendingUsers.length > 1 ? 's' : ''} awaiting approval.`
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-charcoal mb-2">User Management</h1>
          <p className="text-charcoal-light text-lg">Manage users, roles, and access permissions</p>
        </div>
        {activeTab === 'users' && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <UserPlus className="h-5 w-5 mr-2" />
            Add User
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="card p-2">
        <div className="flex space-x-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-royal-blue to-sky-blue text-soft-white shadow-lg'
                    : 'text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10'
                }`}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Forms */}
      <AddUserForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />

      <EditUserForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleAddSuccess}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;