import React, { useState, useEffect } from 'react';
import { X, FileText, DollarSign, Users, Star, Loader2, Upload } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useApps } from '../../hooks/useSupabaseData';
import ImageUpload from '../common/ImageUpload';

interface AddPlanFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedAppId?: string;
}

const AddPlanForm: React.FC<AddPlanFormProps> = ({ isOpen, onClose, onSuccess, preselectedAppId }) => {
  const { apps } = useApps();
  const [formData, setFormData] = useState({
    name: '',
    app_id: preselectedAppId || '',
    price: '',
    billing: 'monthly',
    currency: 'USD',
    max_users: '',
    description: '',
    is_popular: false,
    icon_url: null as string | null,
    discount_percentage: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update app_id when preselectedAppId changes
  useEffect(() => {
    if (preselectedAppId) {
      setFormData(prev => ({ ...prev, app_id: preselectedAppId }));
    }
  }, [preselectedAppId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('subscription_plans')
        .insert([{
          ...formData,
          price: parseFloat(formData.price) || 0,
          discount_percentage: parseFloat(formData.discount_percentage) || 0,
          max_users: formData.max_users === 'unlimited' ? -1 : parseInt(formData.max_users) || 1,
          features: [] // Features will be mapped separately
        }]);

      if (error) throw error;

      setFormData({
        name: '',
        app_id: preselectedAppId || '',
        price: '',
        billing: 'monthly',
        currency: 'USD',
        max_users: '',
        description: '',
        is_popular: false,
        icon_url: null,
        discount_percentage: '',
        status: 'active'
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

  const handleIconChange = (iconUrl: string | null) => {
    setFormData(prev => ({
      ...prev,
      icon_url: iconUrl
    }));
  };

  const currencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'SEK', name: 'Swedish Krona', symbol: 'kr' },
    { code: 'NOK', name: 'Norwegian Krone', symbol: 'kr' },
    { code: 'DKK', name: 'Danish Krone', symbol: 'kr' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Add New Plan</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Plan Icon */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-4">
              <Upload className="h-4 w-4 inline mr-1" />
              Plan Icon
            </label>
            <div className="flex items-center space-x-4">
              <ImageUpload
                currentImage={formData.icon_url}
                onImageChange={handleIconChange}
                placeholder="Plan Icon"
                size="lg"
                shape="square"
              />
              <div className="text-sm text-charcoal-light">
                <p>Upload plan icon</p>
                <p className="text-xs">Recommended: 128x128px, PNG or SVG</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Plan Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="input-field"
              placeholder="e.g., Professional, Enterprise"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Select App
            </label>
            <select
              name="app_id"
              value={formData.app_id}
              onChange={handleChange}
              required
              className="input-field"
              disabled={!!preselectedAppId}
            >
              <option value="">Choose an app</option>
              {apps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
            {preselectedAppId && (
              <p className="text-xs text-charcoal-light mt-1">App is pre-selected</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Price
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                className="input-field"
                placeholder="29.99"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Currency
              </label>
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="input-field"
              >
                {currencies.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Billing Cycle
              </label>
              <select
                name="billing"
                value={formData.billing}
                onChange={handleChange}
                className="input-field"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Discount Percentage
              </label>
              <input
                type="number"
                name="discount_percentage"
                value={formData.discount_percentage}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                className="input-field"
                placeholder="0"
              />
              <p className="text-xs text-charcoal-light mt-1">Optional discount (0-100%)</p>
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

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              <Users className="h-4 w-4 inline mr-1" />
              Max Users
            </label>
            <select
              name="max_users"
              value={formData.max_users}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="">Select user limit</option>
              <option value="1">1 User</option>
              <option value="5">5 Users</option>
              <option value="10">10 Users</option>
              <option value="25">25 Users</option>
              <option value="50">50 Users</option>
              <option value="100">100 Users</option>
              <option value="unlimited">Unlimited</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Describe this plan's benefits"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="is_popular"
              checked={formData.is_popular}
              onChange={handleChange}
              className="h-4 w-4 text-royal-blue focus:ring-sky-blue border-light-gray rounded"
            />
            <label className="ml-2 block text-sm text-charcoal">
              <Star className="h-4 w-4 inline mr-1 text-yellow-500" />
              Mark as popular plan
            </label>
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
                'Add Plan'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPlanForm;