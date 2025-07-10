import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Loader2, Edit } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useCustomers, useApps, useSubscriptionPlans } from '../../hooks/useSupabaseData';

interface EditSubscriptionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subscription: any;
}

const EditSubscriptionForm: React.FC<EditSubscriptionFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  subscription 
}) => {
  const { customers } = useCustomers();
  const { apps } = useApps();
  const { plans } = useSubscriptionPlans();
  
  const [formData, setFormData] = useState({
    customer_id: '',
    app_id: '',
    plan_id: '',
    status: 'active',
    start_date: '',
    end_date: '',
    billing: 'monthly'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Populate form data when subscription changes
  useEffect(() => {
    if (subscription) {
      setFormData({
        customer_id: subscription.customer_id || '',
        app_id: subscription.app_id || '',
        plan_id: subscription.plan_id || '',
        status: subscription.status || 'active',
        start_date: subscription.start_date ? new Date(subscription.start_date).toISOString().split('T')[0] : '',
        end_date: subscription.end_date ? new Date(subscription.end_date).toISOString().split('T')[0] : '',
        billing: subscription.billing || 'monthly'
      });
    }
  }, [subscription]);

  const selectedPlan = plans.find(p => p.id === formData.plan_id);
  const filteredPlans = plans.filter(p => p.app_id === formData.app_id);

  const calculateEndDate = (startDate: string, billing: string) => {
    const start = new Date(startDate);
    const end = new Date(start);
    
    if (billing === 'monthly') {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }
    
    return end.toISOString().split('T')[0];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!selectedPlan) {
        throw new Error('Please select a plan');
      }

      const endDate = formData.end_date || calculateEndDate(formData.start_date, formData.billing);

      const { error } = await supabase
        .from('customer_subscriptions')
        .update({
          customer_id: formData.customer_id,
          app_id: formData.app_id,
          plan_id: formData.plan_id,
          status: formData.status,
          start_date: formData.start_date,
          end_date: endDate,
          price: selectedPlan.price,
          billing: selectedPlan.billing,
          enabled_features: selectedPlan.features
        })
        .eq('id', subscription.id);

      if (error) throw error;

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Reset plan when app changes
      if (name === 'app_id') {
        updated.plan_id = '';
      }
      
      // Auto-calculate end date when start date or billing changes
      if (name === 'start_date' || name === 'billing') {
        updated.end_date = calculateEndDate(
          name === 'start_date' ? value : updated.start_date,
          name === 'billing' ? value : updated.billing
        );
      }
      
      return updated;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Edit className="h-5 w-5 mr-2 text-blue-600" />
            Edit Subscription
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name} - {customer.company}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              App
            </label>
            <select
              name="app_id"
              value={formData.app_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select an app</option>
              {apps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Subscription Plan
            </label>
            <select
              name="plan_id"
              value={formData.plan_id}
              onChange={handleChange}
              required
              disabled={!formData.app_id}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            >
              <option value="">Select a plan</option>
              {filteredPlans.map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price}/{plan.billing}
                </option>
              ))}
            </select>
            {!formData.app_id && (
              <p className="text-xs text-gray-500 mt-1">Select an app first</p>
            )}
          </div>

          {selectedPlan && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-900">{selectedPlan.name}</h4>
              <p className="text-sm text-blue-700">{selectedPlan.description}</p>
              <p className="text-sm text-blue-700 mt-1">
                <strong>${selectedPlan.price}/{selectedPlan.billing}</strong> • 
                {selectedPlan.max_users === -1 ? ' Unlimited users' : ` ${selectedPlan.max_users} users`}
              </p>
              {selectedPlan.features && selectedPlan.features.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-blue-900 mb-1">Features:</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedPlan.features.slice(0, 3).map((feature: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                        {feature}
                      </span>
                    ))}
                    {selectedPlan.features.length > 3 && (
                      <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                        +{selectedPlan.features.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Auto-calculated if left empty</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Subscription'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSubscriptionForm; 