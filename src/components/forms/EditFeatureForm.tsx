import React, { useState, useEffect } from 'react';
import { X, Settings, DollarSign, Package, Star, Loader2, FileText } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApps } from '../../hooks/useSupabaseData';

interface EditFeatureFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  feature: any;
}

const EditFeatureForm: React.FC<EditFeatureFormProps> = ({ isOpen, onClose, onSuccess, feature }) => {
  const { apps } = useApps();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    app_id: '',
    feature_type: 'basic',
    base_price: '',
    status: 'active',
    is_default: false,
    feature_code: '',
    metadata: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (feature) {
      setFormData({
        name: feature.name || '',
        description: feature.description || '',
        app_id: feature.app_id || '',
        feature_type: feature.feature_type || 'basic',
        base_price: feature.base_price?.toString() || '',
        status: feature.status || 'active',
        is_default: feature.is_default || false,
        feature_code: feature.feature_code || '',
        metadata: feature.metadata ? JSON.stringify(feature.metadata, null, 2) : ''
      });
    }
  }, [feature]);

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
        .update({
          ...formData,
          base_price: parseFloat(formData.base_price) || 0,
          feature_code: formData.feature_code || null,
          metadata,
          updated_at: new Date().toISOString()
        })
        .eq('id', feature.id);

      if (error) throw error;

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

  if (!isOpen || !feature) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Edit Feature</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Feature Info Display */}
          <div className="bg-light-gray rounded-xl p-4">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
                <Settings className="h-6 w-6 text-soft-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal">{feature.name}</h3>
                <p className="text-charcoal-light">{feature.app_name}</p>
              </div>
            </div>
          </div>

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
                >
                  <option value="">Select Application</option>
                  {apps.map(app => (
                    <option key={app.id} value={app.id}>{app.name}</option>
                  ))}
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

            {/* Feature Code */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-charcoal mb-2">
                <Settings className="h-4 w-4 inline mr-1" />
                Feature Code (Optional)
              </label>
              <input
                type="text"
                name="feature_code"
                value={formData.feature_code}
                onChange={handleChange}
                className="input-field"
                placeholder="Enter feature code from API (e.g., ADV_ANALYTICS)"
              />
              <p className="text-xs text-charcoal-light mt-1">
                Feature code from the source API that maps to this feature. Leave empty if not needed.
              </p>
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
                'Update Feature'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditFeatureForm;