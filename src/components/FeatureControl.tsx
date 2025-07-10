import React, { useState } from 'react';
import { Shield, Search, User, Package, Loader2, Save, CheckCircle, Settings, DollarSign, Calendar, Building, CreditCard, Clock, Users, Star } from 'lucide-react';
import { useApps, useCustomers, useCustomerSubscriptions } from '../hooks/useSupabaseData';
import { useCustomerFeatureAccess } from '../hooks/useCustomerFeatureAccess';
import CompanyLogo from './common/CompanyLogo';
import StatusIcon from './common/StatusIcon';

const FeatureControl: React.FC = () => {
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<{[key: string]: boolean}>({});
  
  const { apps, loading: appsLoading } = useApps();
  const { customers, loading: customersLoading } = useCustomers();
  const { subscriptions, loading: subscriptionsLoading } = useCustomerSubscriptions();
  const { featureAccess, loading: featureLoading, toggleFeatureAccess } = useCustomerFeatureAccess(
    selectedCustomerId, 
    selectedSubscriptionId
  );

  const loading = appsLoading || customersLoading || subscriptionsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading feature control...</span>
      </div>
    );
  }

  // Filter apps based on selected customer's subscriptions
  const customerSubscriptions = subscriptions.filter(sub => sub.customer_id === selectedCustomerId);
  const customerApps = apps.filter(app => 
    customerSubscriptions.some(sub => sub.app_id === app.id)
  );

  // Filter subscriptions based on selected customer and app
  const filteredSubscriptions = subscriptions.filter(sub => 
    sub.customer_id === selectedCustomerId && sub.app_id === selectedAppId
  );

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
  const selectedApp = apps.find(app => app.id === selectedAppId);
  const selectedSubscription = subscriptions.find(sub => sub.id === selectedSubscriptionId);

  const handleFeatureToggle = (accessId: string, isEnabled: boolean) => {
    setPendingChanges(prev => ({
      ...prev,
      [accessId]: isEnabled
    }));
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    let allSuccess = true;

    for (const [accessId, isEnabled] of Object.entries(pendingChanges)) {
      const success = await toggleFeatureAccess(accessId, isEnabled);
      if (!success) {
        allSuccess = false;
      }
    }

    if (allSuccess) {
      setPendingChanges({});
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setSaving(false);
  };

  const handleCustomerChange = (customerId: string) => {
    setSelectedCustomerId(customerId);
    setSelectedAppId('');
    setSelectedSubscriptionId('');
    setPendingChanges({});
  };

  const handleAppChange = (appId: string) => {
    setSelectedAppId(appId);
    setSelectedSubscriptionId('');
    setPendingChanges({});
  };

  const handleSubscriptionChange = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    setPendingChanges({});
  };

  const hasChanges = Object.keys(pendingChanges).length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-charcoal mb-2">Feature Control Center</h1>
        <p className="text-charcoal-light text-lg">
          Manage customer-specific feature access for their subscriptions
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <p className="text-green-800 font-medium">Feature access updated successfully!</p>
          </div>
        </div>
      )}

      {/* Selection Boxes - Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer Selection */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-royal-blue text-soft-white rounded-full flex items-center justify-center font-bold mr-3">
              1
            </div>
            <h2 className="text-lg font-bold text-charcoal">Customer</h2>
          </div>
          
          <div className="relative mb-4">
            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
            <select
              value={selectedCustomerId}
              onChange={(e) => handleCustomerChange(e.target.value)}
              className="input-field pl-12 w-full"
            >
              <option value="">Choose customer...</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.company}
                </option>
              ))}
            </select>
          </div>

          {selectedCustomer && (
            <div className="p-3 bg-light-gray rounded-xl">
              <div className="flex items-center mb-2">
                <CompanyLogo 
                  src={selectedCustomer.logo_url} 
                  companyName={selectedCustomer.company} 
                  size="sm" 
                  className="mr-3"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-charcoal text-sm truncate">{selectedCustomer.company}</h3>
                  <p className="text-xs text-charcoal-light truncate">{selectedCustomer.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <StatusIcon status={selectedCustomer.status} type="customer" size="sm" />
                <span className="text-xs text-charcoal-light">
                  {customerSubscriptions.length} subscription(s)
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Product Selection */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-royal-blue text-soft-white rounded-full flex items-center justify-center font-bold mr-3">
              2
            </div>
            <h2 className="text-lg font-bold text-charcoal">Product</h2>
          </div>
          
          <div className="relative mb-4">
            <Package className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
            <select
              value={selectedAppId}
              onChange={(e) => handleAppChange(e.target.value)}
              className="input-field pl-12 w-full"
              disabled={!selectedCustomerId}
            >
              <option value="">Choose product...</option>
              {customerApps.map(app => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
          </div>

          {selectedApp && (
            <div className="p-3 bg-light-gray rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-charcoal text-sm">{selectedApp.name}</h3>
                <StatusIcon status={selectedApp.status} type="app" size="sm" />
              </div>
              <p className="text-xs text-charcoal-light mb-2">{selectedApp.category}</p>
              <p className="text-xs text-charcoal-light line-clamp-2">{selectedApp.description}</p>
            </div>
          )}
        </div>

        {/* Plan Selection */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-royal-blue text-soft-white rounded-full flex items-center justify-center font-bold mr-3">
              3
            </div>
            <h2 className="text-lg font-bold text-charcoal">Plan</h2>
          </div>
          
          <div className="relative mb-4">
            <CreditCard className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
            <select
              value={selectedSubscriptionId}
              onChange={(e) => handleSubscriptionChange(e.target.value)}
              className="input-field pl-12 w-full"
              disabled={!selectedAppId}
            >
              <option value="">Choose plan...</option>
              {filteredSubscriptions.map(subscription => (
                <option key={subscription.id} value={subscription.id}>
                  {subscription.plan_name}
                </option>
              ))}
            </select>
          </div>

          {selectedSubscription && (
            <div className="p-3 bg-light-gray rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-charcoal text-sm">{selectedSubscription.plan_name}</h3>
                <StatusIcon status={selectedSubscription.status} type="subscription" size="sm" />
              </div>
              <div className="space-y-1 text-xs text-charcoal-light">
                <div className="flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" />
                  ${selectedSubscription.price}/{selectedSubscription.billing}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(selectedSubscription.start_date).toLocaleDateString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Subscription Information */}
      {selectedSubscription && (
        <div className="card p-6">
          <h3 className="text-xl font-bold text-charcoal mb-6">Subscription Details</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Subscription Overview */}
            <div>
              <h4 className="text-lg font-semibold text-charcoal mb-4">Overview</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-royal-blue mr-3" />
                    <span className="font-medium text-charcoal">Plan</span>
                  </div>
                  <span className="text-charcoal">{selectedSubscription.plan_name}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center">
                    <DollarSign className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-charcoal">Price</span>
                  </div>
                  <span className="text-charcoal font-semibold">
                    ${selectedSubscription.price}/{selectedSubscription.billing}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-sky-blue mr-3" />
                    <span className="font-medium text-charcoal">Status</span>
                  </div>
                  <StatusIcon status={selectedSubscription.status} type="subscription" size="sm" />
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-charcoal">Billing Cycle</span>
                  </div>
                  <div className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                    selectedSubscription.billing === 'yearly' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedSubscription.billing}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-indigo-600 mr-3" />
                    <span className="font-medium text-charcoal">User Limit</span>
                  </div>
                  <span className="text-charcoal font-semibold">
                    {selectedSubscription.max_users === -1 ? 'Unlimited' : selectedSubscription.max_users} users
                  </span>
                </div>
              </div>
            </div>

            {/* Subscription Timeline */}
            <div>
              <h4 className="text-lg font-semibold text-charcoal mb-4">Timeline</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-green-600 mr-3" />
                    <span className="font-medium text-charcoal">Start Date</span>
                  </div>
                  <span className="text-charcoal">
                    {new Date(selectedSubscription.start_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center mb-2">
                    <Calendar className="h-5 w-5 text-red-600 mr-3" />
                    <span className="font-medium text-charcoal">End Date</span>
                  </div>
                  <span className="text-charcoal">
                    {new Date(selectedSubscription.end_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center mb-2">
                    <Clock className="h-5 w-5 text-sky-blue mr-3" />
                    <span className="font-medium text-charcoal">Duration</span>
                  </div>
                  <span className="text-charcoal">
                    {Math.ceil((new Date(selectedSubscription.end_date).getTime() - new Date(selectedSubscription.start_date).getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center mb-2">
                    <Building className="h-5 w-5 text-orange-600 mr-3" />
                    <span className="font-medium text-charcoal">Created</span>
                  </div>
                  <span className="text-charcoal">
                    {new Date(selectedSubscription.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 text-purple-600 mr-3" />
                    <span className="font-medium text-charcoal">Total Features</span>
                  </div>
                  <span className="text-charcoal">
                    {selectedSubscription.enabled_features.length} features
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-light-gray rounded-xl">
                  <div className="flex items-center">
                    <Settings className="h-5 w-5 text-gray-600 mr-3" />
                    <span className="font-medium text-charcoal">Last Updated</span>
                  </div>
                  <span className="text-charcoal">
                    {new Date(selectedSubscription.updated_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feature Management */}
      {selectedSubscriptionId && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-charcoal">Feature Management</h3>
              <p className="text-charcoal-light">
                Control individual feature access for this subscription
              </p>
            </div>
            {hasChanges && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
                <span className="text-yellow-800 text-sm font-medium">
                  {Object.keys(pendingChanges).length} unsaved change(s)
                </span>
              </div>
            )}
          </div>

          {featureLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-royal-blue mr-2" />
              <span className="text-charcoal">Loading features...</span>
            </div>
          ) : featureAccess.length > 0 ? (
            <div className="space-y-4">
              {featureAccess.map(access => {
                const currentState = pendingChanges.hasOwnProperty(access.id) 
                  ? pendingChanges[access.id] 
                  : access.is_enabled;
                const hasChange = pendingChanges.hasOwnProperty(access.id);

                return (
                  <div
                    key={access.id}
                    className={`p-4 rounded-xl border transition-all ${
                      hasChange 
                        ? 'border-yellow-300 bg-yellow-50' 
                        : currentState 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="font-semibold text-charcoal mr-3">{access.feature_name}</h4>
                          <div className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-sky-blue bg-opacity-20 text-royal-blue capitalize">
                            {access.feature_type}
                          </div>
                          {access.base_price > 0 && (
                            <div className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-green-100 text-green-800 ml-2">
                              ${access.base_price}
                            </div>
                          )}
                          {hasChange && (
                            <div className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800 ml-2">
                              Modified
                            </div>
                          )}
                        </div>
                        {access.feature_description && (
                          <p className="text-charcoal-light text-sm mb-2">{access.feature_description}</p>
                        )}
                        <div className="text-xs text-charcoal-light">
                          {currentState ? (
                            access.enabled_date ? (
                              `Enabled on ${new Date(access.enabled_date).toLocaleDateString()}`
                            ) : (
                              'Currently enabled'
                            )
                          ) : (
                            access.disabled_date ? (
                              `Disabled on ${new Date(access.disabled_date).toLocaleDateString()}`
                            ) : (
                              'Currently disabled'
                            )
                          )}
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleFeatureToggle(access.id, !currentState)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-royal-blue focus:ring-offset-2 ${
                          currentState ? 'bg-green-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-soft-white transition-transform ${
                            currentState ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Settings className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
              <h4 className="text-lg font-medium text-charcoal mb-2">No features available</h4>
              <p className="text-charcoal-light">
                This subscription doesn't have any configurable features yet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Save Button */}
      {selectedSubscriptionId && hasChanges && (
        <div className="flex justify-center">
          <button
            onClick={handleSaveChanges}
            disabled={saving}
            className="btn-primary flex items-center px-8 py-4 text-lg"
          >
            {saving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            {saving ? 'Saving Changes...' : `Save ${Object.keys(pendingChanges).length} Change(s)`}
          </button>
        </div>
      )}

      {/* Instructions */}
      {!selectedCustomerId && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-10 w-10 text-charcoal-light" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">Customer Feature Control</h3>
          <p className="text-charcoal-light max-w-md mx-auto">
            Select a customer, choose their subscribed product, pick the specific plan, 
            then manage individual feature access with granular control.
          </p>
        </div>
      )}
    </div>
  );
};

export default FeatureControl;