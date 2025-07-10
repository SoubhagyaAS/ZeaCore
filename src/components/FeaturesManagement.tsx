import React, { useState } from 'react';
import { Plus, Search, Settings, DollarSign, Star, Edit, Trash2, Loader2, Package, ToggleLeft, ToggleRight } from 'lucide-react';
import { useFeatures, useApps } from '../hooks/useSupabaseData';
import AddFeatureForm from './forms/AddFeatureForm';
import EditFeatureForm from './forms/EditFeatureForm';
import StatusIcon from './common/StatusIcon';
import AppLogo from './common/AppLogo';

const FeaturesManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppId, setSelectedAppId] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  
  const { features, loading, error, refetch } = useFeatures();
  const { apps } = useApps();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading features...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading features: {error}</p>
      </div>
    );
  }

  // Filter features based on selected app and other filters
  const filteredFeatures = features.filter(feature => {
    const matchesApp = !selectedAppId || feature.app_id === selectedAppId;
    const matchesSearch = feature.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         feature.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || feature.status === statusFilter;
    return matchesApp && matchesSearch && matchesStatus;
  });

  // Get stats for selected app or all apps
  const getStats = () => {
    const relevantFeatures = selectedAppId 
      ? features.filter(f => f.app_id === selectedAppId)
      : features;
    
    const activeFeatures = relevantFeatures.filter(f => f.status === 'active');
    const activeFeaturesBasePriceSum = activeFeatures.reduce((sum, f) => sum + (f.base_price || 0), 0);
    
    return {
      total: relevantFeatures.length,
      active: activeFeatures.length,
      activeFeaturesBasePriceSum,
      defaults: relevantFeatures.filter(f => f.is_default).length
    };
  };

  const stats = getStats();
  const selectedApp = apps.find(app => app.id === selectedAppId);

  const handleAddSuccess = () => {
    refetch();
  };

  const handleEditFeature = (feature: any) => {
    setSelectedFeature(feature);
    setShowEditForm(true);
  };

  const handleToggleStatus = async (feature: any) => {
    try {
      const newStatus = feature.status === 'active' ? 'inactive' : 'active';
      // This would be implemented in the hook
      console.log(`Toggle feature ${feature.id} to ${newStatus}`);
      refetch();
    } catch (error) {
      console.error('Error toggling feature status:', error);
    }
  };

  const handleToggleDefault = async (feature: any) => {
    try {
      // This would be implemented in the hook
      console.log(`Toggle feature ${feature.id} default to ${!feature.is_default}`);
      refetch();
    } catch (error) {
      console.error('Error toggling feature default:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-charcoal mb-2">Features</h1>
          <p className="text-charcoal-light text-lg">
            {selectedApp 
              ? `Manage features for ${selectedApp.name}`
              : 'Select an app to manage its features'
            }
          </p>
        </div>
        {selectedAppId && (
          <button 
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Feature
          </button>
        )}
      </div>

      {/* App Selection */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-charcoal mb-4">Select Application</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => setSelectedAppId(app.id === selectedAppId ? '' : app.id)}
              className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
                selectedAppId === app.id
                  ? 'border-royal-blue bg-sky-blue bg-opacity-10 shadow-lg transform scale-105'
                  : 'border-light-gray hover:border-sky-blue hover:bg-sky-blue hover:bg-opacity-5'
              }`}
            >
              <div className="flex items-center mb-3">
                <AppLogo 
                  src={app.logo_url} 
                  appName={app.name} 
                  size="md" 
                  className="mr-3"
                />
                <div>
                  <h3 className="font-semibold text-charcoal">{app.name}</h3>
                  <p className="text-sm text-charcoal-light">{app.category}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-charcoal-light">
                  {features.filter(f => f.app_id === app.id).length} features
                </div>
                <StatusIcon 
                  status={app.status} 
                  type="app" 
                  size="sm"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedAppId && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-light">Total Features</p>
                  <p className="text-2xl font-bold text-charcoal">{stats.total}</p>
                </div>
                <div className="bg-royal-blue bg-opacity-10 p-3 rounded-xl">
                  <Settings className="h-6 w-6 text-royal-blue" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-light">Active Features</p>
                  <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <div className="bg-green-100 p-3 rounded-xl">
                  <Settings className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-light">Active Features Cost</p>
                  <p className="text-2xl font-bold text-purple-600">${stats.activeFeaturesBasePriceSum.toFixed(2)}</p>
                </div>
                <div className="bg-purple-100 p-3 rounded-xl">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-charcoal-light">Default Features</p>
                  <p className="text-2xl font-bold text-sky-blue">{stats.defaults}</p>
                </div>
                <div className="bg-sky-blue bg-opacity-10 p-3 rounded-xl">
                  <Star className="h-6 w-6 text-sky-blue" />
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search features..."
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
              </select>
              
              <div className="flex items-center text-sm text-charcoal-light">
                <Settings className="h-4 w-4 mr-2" />
                {filteredFeatures.length} of {stats.total} features
              </div>
            </div>
          </div>

          {/* Features Table */}
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-light-gray">
                <thead className="bg-light-gray">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Feature
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Base Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Default
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-soft-white divide-y divide-light-gray">
                  {filteredFeatures.map((feature) => (
                    <tr key={feature.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-charcoal">{feature.name}</div>
                          {feature.description && (
                            <div className="text-sm text-charcoal-light line-clamp-1">{feature.description}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="inline-flex px-3 py-1 text-xs rounded-full font-medium bg-sky-blue bg-opacity-20 text-royal-blue capitalize">
                          {feature.feature_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-charcoal">
                          <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                          {feature.base_price === 0 ? 'Free' : `$${feature.base_price}`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(feature)}
                          className="flex items-center"
                        >
                          {feature.status === 'active' ? (
                            <ToggleRight className="h-6 w-6 text-green-600 hover:text-green-700" />
                          ) : (
                            <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleDefault(feature)}
                          className="flex items-center"
                        >
                          {feature.is_default ? (
                            <Star className="h-5 w-5 text-yellow-500 hover:text-yellow-600 fill-current" />
                          ) : (
                            <Star className="h-5 w-5 text-gray-400 hover:text-yellow-500" />
                          )}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                        {new Date(feature.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleEditFeature(feature)}
                            className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {filteredFeatures.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Settings className="h-10 w-10 text-charcoal-light" />
              </div>
              <h3 className="text-xl font-semibold text-charcoal mb-2">No features found</h3>
              <p className="text-charcoal-light">
                {stats.total === 0 
                  ? `Create your first feature for ${selectedApp?.name}`
                  : 'Try adjusting your search or filter criteria'
                }
              </p>
            </div>
          )}
        </>
      )}

      {!selectedAppId && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="h-10 w-10 text-charcoal-light" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">Select an Application</h3>
          <p className="text-charcoal-light">Choose an app from the boxes above to view and manage its features</p>
        </div>
      )}

      <AddFeatureForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
        preselectedAppId={selectedAppId}
      />

      <EditFeatureForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleAddSuccess}
        feature={selectedFeature}
      />
    </div>
  );
};

export default FeaturesManagement;