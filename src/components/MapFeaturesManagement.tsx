import React, { useState } from 'react';
import { MapPin, Package, FileText, Settings, CheckSquare, Square, Loader2, DollarSign, Percent, Calculator } from 'lucide-react';
import { useApps, useSubscriptionPlans, useFeatures } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import { useToast } from '../context/ToastContext';
import AppLogo from './common/AppLogo';
import StatusIcon from './common/StatusIcon';

const MapFeaturesManagement: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [customDiscount, setCustomDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  
  const { apps, loading: appsLoading } = useApps();
  const { plans, loading: plansLoading } = useSubscriptionPlans();
  const { features, loading: featuresLoading } = useFeatures();

  const isLoading = appsLoading || plansLoading || featuresLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading map features...</span>
      </div>
    );
  }

  // Filter plans based on selected app
  const filteredPlans = plans.filter(plan => plan.app_id === selectedAppId);
  
  // Filter features based on selected app and only show active features
  const availableFeatures = features.filter(feature => 
    feature.app_id === selectedAppId && feature.status === 'active'
  );

  const selectedApp = apps.find(app => app.id === selectedAppId);
  const selectedPlan = plans.find(plan => plan.id === selectedPlanId);

  const handleFeatureToggle = (featureId: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureId) 
        ? prev.filter(id => id !== featureId)
        : [...prev, featureId]
    );
  };

  // Calculate pricing based on selected features
  const calculatePricing = () => {
    if (!selectedPlan) return { monthly: 0, yearly: 0, featuresTotal: 0 };

    const basePlanPrice = selectedPlan.price;
    const featuresTotal = availableFeatures
      .filter(f => selectedFeatures.includes(f.id))
      .reduce((sum, f) => sum + (f.base_price || 0), 0);

    const subtotal = basePlanPrice + featuresTotal;
    
    // Apply plan discount first, then custom discount
    const planDiscountAmount = subtotal * (selectedPlan.discount_percentage || 0) / 100;
    const afterPlanDiscount = subtotal - planDiscountAmount;
    
    const customDiscountAmount = afterPlanDiscount * customDiscount / 100;
    const finalPrice = afterPlanDiscount - customDiscountAmount;

    const monthly = selectedPlan.billing === 'monthly' ? finalPrice : finalPrice / 12;
    const yearly = selectedPlan.billing === 'yearly' ? finalPrice : finalPrice * 12;

    return {
      monthly: Math.max(0, monthly),
      yearly: Math.max(0, yearly),
      featuresTotal,
      basePlanPrice,
      planDiscountAmount,
      customDiscountAmount,
      totalDiscount: planDiscountAmount + customDiscountAmount
    };
  };

  const pricing = calculatePricing();

  const handleSaveMapping = async () => {
    if (!selectedPlanId) return;
    
    setLoading(true);
    try {
      // Update the plan with selected features and custom discount
      const { error } = await supabase
        .from('subscription_plans')
        .update({
          features: selectedFeatures,
          discount_percentage: Math.max(selectedPlan?.discount_percentage || 0, customDiscount),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedPlanId);

      if (error) throw error;
      
      showToast('Feature mapping saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving feature mapping:', error);
      showToast('Error saving feature mapping', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    const symbols: { [key: string]: string } = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'C$',
      'AUD': 'A$',
      'JPY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NOK': 'kr',
      'DKK': 'kr'
    };
    return symbols[currency] || currency;
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-charcoal mb-2">Map Features</h1>
        <p className="text-charcoal-light text-lg">
          Map active features to subscription plans and configure pricing with discounts
        </p>
      </div>

      {/* Step 1: App Selection */}
      <div className="card p-6">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 bg-royal-blue text-soft-white rounded-full flex items-center justify-center font-bold mr-3">
            1
          </div>
          <h2 className="text-xl font-bold text-charcoal">Select Application</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {apps.map((app) => (
            <button
              key={app.id}
              onClick={() => {
                setSelectedAppId(app.id === selectedAppId ? '' : app.id);
                setSelectedPlanId(''); // Reset plan selection when app changes
                setSelectedFeatures([]); // Reset feature selection
                setCustomDiscount(0); // Reset custom discount
              }}
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
                  {plans.filter(p => p.app_id === app.id).length} plans
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

      {/* Step 2: Plan Selection */}
      {selectedAppId && (
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-royal-blue text-soft-white rounded-full flex items-center justify-center font-bold mr-3">
              2
            </div>
            <h2 className="text-xl font-bold text-charcoal">
              Select Plan for {selectedApp?.name}
            </h2>
          </div>
          
          {filteredPlans.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredPlans.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => {
                    setSelectedPlanId(plan.id === selectedPlanId ? '' : plan.id);
                    setSelectedFeatures([]); // Reset feature selection when plan changes
                    setCustomDiscount(0); // Reset custom discount
                  }}
                  className={`p-3 rounded-lg border-2 text-left transition-all duration-300 ${
                    selectedPlanId === plan.id
                      ? 'border-royal-blue bg-sky-blue bg-opacity-10 shadow-lg transform scale-105'
                      : 'border-light-gray hover:border-sky-blue hover:bg-sky-blue hover:bg-opacity-5'
                  }`}
                >
                  {/* Plan Icon and Status */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      {plan.icon_url ? (
                        <img 
                          src={plan.icon_url} 
                          alt={plan.name}
                          className="w-6 h-6 rounded-md mr-2"
                        />
                      ) : (
                        <div className="w-6 h-6 bg-gradient-to-br from-royal-blue to-sky-blue rounded-md flex items-center justify-center mr-2">
                          <Package className="h-3 w-3 text-soft-white" />
                        </div>
                      )}
                      <StatusIcon 
                        status="active" 
                        type="subscription" 
                        size="sm"
                        className="mr-1"
                      />
                    </div>
                    {plan.is_popular && (
                      <div className="bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-full text-xs font-medium">
                        Popular
                      </div>
                    )}
                  </div>
                  
                  {/* Plan Name */}
                  <h3 className="font-semibold text-charcoal text-sm mb-1 line-clamp-1">{plan.name}</h3>
                  
                  {/* Price */}
                  <div className="mb-1">
                    <span className="text-lg font-bold text-charcoal">
                      {getCurrencySymbol(plan.currency)}{plan.price}
                    </span>
                    <span className="text-charcoal-light text-xs ml-1">/{plan.billing === 'monthly' ? 'mo' : 'yr'}</span>
                  </div>
                  
                  {/* Discount Badge */}
                  {plan.discount_percentage > 0 && (
                    <div className="inline-flex px-1.5 py-0.5 text-xs rounded-full font-medium bg-green-100 text-green-800 mb-1">
                      {plan.discount_percentage}% OFF
                    </div>
                  )}
                  
                  {/* Description */}
                  {plan.description && (
                    <p className="text-xs text-charcoal-light line-clamp-2 mb-1">{plan.description}</p>
                  )}
                  
                  {/* Users */}
                  <div className="text-xs text-charcoal-light">
                    {plan.max_users === -1 ? 'Unlimited' : `${plan.max_users} users`}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
              <h3 className="text-lg font-medium text-charcoal mb-2">No plans available</h3>
              <p className="text-charcoal-light">Create plans for this app first</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Feature Selection & Pricing */}
      {selectedPlanId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Features Table */}
          <div className="lg:col-span-2 card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-royal-blue text-soft-white rounded-full flex items-center justify-center font-bold mr-3">
                  3
                </div>
                <div>
                  <h2 className="text-xl font-bold text-charcoal">
                    Select Features for {selectedPlan?.name}
                  </h2>
                  <p className="text-charcoal-light">Choose which active features to include in this plan</p>
                </div>
              </div>
            </div>

            {availableFeatures.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-light-gray">
                  <thead className="bg-light-gray">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Select
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Feature
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Default
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-soft-white divide-y divide-light-gray">
                    {availableFeatures.map((feature) => (
                      <tr 
                        key={feature.id} 
                        className={`hover:bg-sky-blue hover:bg-opacity-5 cursor-pointer ${
                          selectedFeatures.includes(feature.id) ? 'bg-sky-blue bg-opacity-10' : ''
                        }`}
                        onClick={() => handleFeatureToggle(feature.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          {selectedFeatures.includes(feature.id) ? (
                            <CheckSquare className="h-5 w-5 text-royal-blue" />
                          ) : (
                            <Square className="h-5 w-5 text-charcoal-light" />
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <div className="text-sm font-medium text-charcoal">{feature.name}</div>
                            {feature.description && (
                              <div className="text-sm text-charcoal-light">{feature.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-sky-blue bg-opacity-20 text-royal-blue capitalize">
                            {feature.feature_type}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-charcoal">
                            <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                            {feature.base_price === 0 ? 'Free' : `${feature.base_price}`}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {feature.is_default && (
                            <div className="inline-flex px-2 py-1 text-xs rounded-full font-medium bg-yellow-100 text-yellow-800">
                              Default
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <Settings className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
                <h3 className="text-lg font-medium text-charcoal mb-2">No active features available</h3>
                <p className="text-charcoal-light">Create and activate features for this app first</p>
              </div>
            )}
          </div>

          {/* Pricing Calculator */}
          <div className="card p-6">
            <div className="flex items-center mb-6">
              <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-4">
                <Calculator className="h-6 w-6 text-soft-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-charcoal">Pricing Calculator</h3>
                <p className="text-charcoal-light">Configure pricing and discounts</p>
              </div>
            </div>

            {/* Custom Discount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-charcoal mb-2">
                <Percent className="h-4 w-4 inline mr-1" />
                Additional Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={customDiscount}
                onChange={(e) => setCustomDiscount(Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)))}
                className="input-field"
                placeholder="0"
              />
              <p className="text-xs text-charcoal-light mt-1">Additional discount on top of plan discount</p>
            </div>

            {/* Pricing Breakdown */}
            <div className="space-y-4">
              <div className="bg-light-gray rounded-xl p-4">
                <h4 className="font-semibold text-charcoal mb-3">Pricing Breakdown</h4>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Base Plan Price:</span>
                    <span className="font-medium text-charcoal">
                      {getCurrencySymbol(selectedPlan?.currency || 'USD')}{pricing.basePlanPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-charcoal-light">Features Total:</span>
                    <span className="font-medium text-charcoal">
                      {getCurrencySymbol(selectedPlan?.currency || 'USD')}{pricing.featuresTotal.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between">
                      <span className="text-charcoal-light">Subtotal:</span>
                      <span className="font-medium text-charcoal">
                        {getCurrencySymbol(selectedPlan?.currency || 'USD')}{(pricing.basePlanPrice + pricing.featuresTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {(selectedPlan?.discount_percentage || 0) > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Plan Discount ({selectedPlan?.discount_percentage}%):</span>
                      <span>-{getCurrencySymbol(selectedPlan?.currency || 'USD')}{pricing.planDiscountAmount?.toFixed(2)}</span>
                    </div>
                  )}

                  {customDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Additional Discount ({customDiscount}%):</span>
                      <span>-{getCurrencySymbol(selectedPlan?.currency || 'USD')}{pricing.customDiscountAmount?.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Final Pricing */}
              <div className="bg-gradient-to-r from-royal-blue to-sky-blue rounded-xl p-4 text-soft-white">
                <h4 className="font-semibold mb-3">Final Pricing</h4>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Monthly Price:</span>
                    <span className="text-xl font-bold">
                      {getCurrencySymbol(selectedPlan?.currency || 'USD')}{pricing.monthly.toFixed(2)}/mo
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Yearly Price:</span>
                    <span className="text-xl font-bold">
                      {getCurrencySymbol(selectedPlan?.currency || 'USD')}{pricing.yearly.toFixed(2)}/yr
                    </span>
                  </div>

                  {pricing.yearly < pricing.monthly * 12 && (
                    <div className="text-xs bg-green-500 bg-opacity-20 rounded p-2 mt-2">
                      Save {getCurrencySymbol(selectedPlan?.currency || 'USD')}{(pricing.monthly * 12 - pricing.yearly).toFixed(2)} with yearly billing
                    </div>
                  )}
                </div>
              </div>

              {/* Selected Features Summary */}
              {selectedFeatures.length > 0 && (
                <div className="bg-sky-blue bg-opacity-10 rounded-xl p-4">
                  <h4 className="font-semibold text-charcoal mb-2">Selected Features ({selectedFeatures.length})</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedFeatures.map(featureId => {
                      const feature = availableFeatures.find(f => f.id === featureId);
                      return feature ? (
                        <span key={featureId} className="px-2 py-1 bg-royal-blue text-soft-white text-xs rounded-full font-medium">
                          {feature.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Save Button */}
              <button
                onClick={handleSaveMapping}
                disabled={loading || selectedFeatures.length === 0}
                className="w-full btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                ) : (
                  <MapPin className="h-5 w-5 mr-2" />
                )}
                Save Feature Mapping
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      {!selectedAppId && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="h-10 w-10 text-charcoal-light" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">Map Features to Plans</h3>
          <p className="text-charcoal-light max-w-md mx-auto">
            Follow the 3-step process: Select an application, choose a subscription plan, 
            then select features and configure pricing with optional discounts.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapFeaturesManagement;