import React, { useState, useEffect } from 'react';
import { X, Settings, DollarSign, Package, Star, Loader2, FileText, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApps } from '../../hooks/useSupabaseData';

interface AddFeatureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedAppId?: string;
}

const AddFeatureForm: React.FC<AddFeatureFormProps> = ({ isOpen, onClose, onSuccess, preselectedAppId }) => {
  const { apps } = useApps();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    app_id: preselectedAppId || '',
    feature_type: 'basic',
    base_price: '',
    status: 'active',
    is_default: false,
    feature_code: '',
    metadata: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [featureCodes, setFeatureCodes] = useState<Array<{code: string, name: string}>>([]);
  const [loadingCodes, setLoadingCodes] = useState(false);

  // Update app_id when preselectedAppId changes
  React.useEffect(() => {
    if (preselectedAppId) {
      setFormData(prev => ({ ...prev, app_id: preselectedAppId }));
    }
  }, [preselectedAppId]);

  // Fetch feature codes from API when app changes
  const fetchFeatureCodes = async (appId: string) => {
    if (!appId) {
      setFeatureCodes([]);
      return;
    }

    const selectedApp = apps.find(app => app.id === appId);
    if (!selectedApp?.api_endpoint || !selectedApp?.api_key) {
      setFeatureCodes([]);
      return;
    }

    setLoadingCodes(true);
    try {
      const response = await fetch(selectedApp.api_endpoint, {
        headers: {
          'Authorization': `Bearer ${selectedApp.api_key}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn(`API request failed: ${response.status} - Feature codes will be empty`);
        setFeatureCodes([]);
        return;
      }

      const data = await response.json();
      
      // Assuming the API returns an array of features with code and name
      // Adjust this based on your actual API response structure
      const codes = data.features?.map((feature: any) => ({
        code: feature.code,
        name: feature.name
      })) || [];

      setFeatureCodes(codes);
    } catch (err) {
      console.warn('Failed to fetch feature codes from API - continuing without codes:', err);
      setFeatureCodes([]);
    } finally {
      setLoadingCodes(false);
    }
  };

  // Fetch feature codes when app_id changes
  useEffect(() => {
    if (formData.app_id) {
      fetchFeatureCodes(formData.app_id);
    } else {
      setFeatureCodes([]);
    }
  }, [formData.app_id, apps]);

  const featureTypes = [
    { value: 'basic', label: 'Basic Feature' },
    { value: 'premium', label: 'Premium Feature' },
    { value: 'addon', label: 'Add-on Feature' },
    { value: 'integration', label: 'Integration' },
    { value: 'api', label: 'API Access' },
    { value: 'storage', label: 'Storage' },
    { value: 'bandwidth', label: 'Bandwidth' },
    { value: 'users', label: 'User Limit' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let metadata = {};
      if (formData.metadata.trim()) {
        try {
          metadata = JSON.parse(formData.metadata);
        } catch {
          setError('Invalid JSON format in metadata field');
          return;
        }
      }

      const { error } = await supabase
        .from('app_features')
        .insert([{
          ...formData,
          base_price: parseFloat(formData.base_price) || 0,
          feature_code: formData.feature_code || null,
          metadata
        }]);

      if (error) throw error;

      setFormData({
        name: '',
        description: '',
        app_id: preselectedAppId || '',
        feature_type: 'basic',
        base_price: '',
        status: 'active',
        is_default: false,
        feature_code: '',
        metadata: ''
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (!isOpen) return null;

  const selectedApp = apps.find(app => app.id === formData.app_id);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">
            Add New Feature {selectedApp && `to ${selectedApp.name}`}
          </h2>
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
                  <Settings className="h-4 w-4 inline mr-1" />
                  Feature Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-field"
                  placeholder="e.g., Advanced Analytics"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Package className="h-4 w-4 inline mr-1" />
                  Application
                </label>
                <select
                  name="app_id"
                  value={formData.app_id}
                  onChange={handleChange}
                  required
                  className="input-field"
                  disabled={!!preselectedAppId}
                >
                  <option value="">Select Application</option>
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
                </select>
                {preselectedAppId && (
                  <p className="text-xs text-charcoal-light mt-1">Application is pre-selected</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="input-field"
                  placeholder="Describe what this feature does and its benefits"
                />
              </div>
            </div>
          </div>

          {/* Feature Configuration */}
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-4">Feature Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  Feature Type
                </label>
                <select
                  name="feature_type"
                  value={formData.feature_type}
                  onChange={handleChange}
                  className="input-field"
                >
                  {featureTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Base Price
                </label>
                <input
                  type="number"
                  name="base_price"
                  value={formData.base_price}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="input-field"
                  placeholder="0.00"
                />
                <p className="text-xs text-charcoal-light mt-1">Set to 0 for free features</p>
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
                </select>
              </div>
            </div>

            {/* Feature Code Mapping */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-charcoal">
                  <Settings className="h-4 w-4 inline mr-1" />
                  Feature Code Mapping (Optional)
                </label>
                {formData.app_id && selectedApp?.api_endpoint && selectedApp?.api_key && (
                  <button
                    type="button"
                    onClick={() => fetchFeatureCodes(formData.app_id)}
                    disabled={loadingCodes}
                    className="flex items-center text-xs text-royal-blue hover:text-sky-blue transition-colors"
                  >
                    <RefreshCw className={`h-3 w-3 mr-1 ${loadingCodes ? 'animate-spin' : ''}`} />
                    Refresh Codes
                  </button>
                )}
              </div>
              
              {formData.app_id ? (
                selectedApp?.api_endpoint && selectedApp?.api_key ? (
                  <select
                    name="feature_code"
                    value={formData.feature_code}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select feature code from API (optional)</option>
                    {featureCodes.map((code) => (
                      <option key={code.code} value={code.code}>
                        {code.code} ({code.name})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-charcoal-light p-3 bg-light-gray rounded-lg">
                    <p className="mb-2">API not configured for this app.</p>
                    <p className="text-xs">You can still add the feature without API mapping. Configure the app's API endpoint and key to enable automatic feature code mapping.</p>
                  </div>
                )
              ) : (
                <div className="text-sm text-charcoal-light p-3 bg-light-gray rounded-lg">
                  Select an application first to load available feature codes
                </div>
              )}
              
              {formData.app_id && selectedApp?.api_endpoint && selectedApp?.api_key && featureCodes.length === 0 && !loadingCodes && (
                <p className="text-xs text-charcoal-light mt-1">
                  No feature codes available from API. You can still add the feature without mapping.
                </p>
              )}
              
              {loadingCodes && (
                <p className="text-xs text-charcoal-light mt-1 flex items-center">
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading feature codes...
                </p>
              )}
            </div>
          </div>

          {/* Advanced Settings */}
          <div>
            <h3 className="text-lg font-semibold text-charcoal mb-4">Advanced Settings</h3>
            
            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_default"
                  checked={formData.is_default}
                  onChange={handleChange}
                  className="h-4 w-4 text-royal-blue focus:ring-sky-blue border-light-gray rounded"
                />
                <label className="ml-3 block text-sm text-charcoal">
                  <Star className="h-4 w-4 inline mr-1 text-yellow-500" />
                  Include by default in new subscriptions
                </label>
              </div>
              <p className="text-xs text-charcoal-light mt-1 ml-7">
                When enabled, this feature will be automatically included in new subscriptions
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <FileText className="h-4 w-4 inline mr-1" />
                Metadata (JSON)
              </label>
              <textarea
                name="metadata"
                value={formData.metadata}
                onChange={handleChange}
                rows={4}
                className="input-field font-mono text-sm"
                placeholder='{"limits": {"requests": 1000}, "config": {"enabled": true}}'
              />
              <p className="text-xs text-charcoal-light mt-1">
                Optional JSON configuration for feature-specific settings
              </p>
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
                'Create Feature'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFeatureForm;