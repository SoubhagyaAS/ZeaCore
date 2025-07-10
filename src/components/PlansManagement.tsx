import React, { useState } from 'react';
import { Plus, Search, DollarSign, Users, Star, Settings, Loader2, FileText, ToggleLeft, ToggleRight, Edit } from 'lucide-react';
import { useSubscriptionPlans, useApps, useFeatures } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import AddPlanForm from './forms/AddPlanForm';
import EditPlanForm from './forms/EditPlanForm';
import AppLogo from './common/AppLogo';
import StatusIcon from './common/StatusIcon';

const PlansManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppId, setSelectedAppId] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const { plans, loading, error, refetch } = useSubscriptionPlans();
  const { apps } = useApps();
  const { features } = useFeatures();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading plans...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading plans: {error}</p>
      </div>
    );
  }

  // Filter plans based on selected app and search
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.app_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesApp = !selectedAppId || plan.app_id === selectedAppId;
    return matchesSearch && matchesApp;
  });

  const getBillingColor = (billing: string) => {
    return billing === 'yearly' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800';
  };

  const handleAddSuccess = () => {
    refetch();
  };

  const handleEditPlan = (plan: any) => {
    setSelectedPlan(plan);
    setShowEditForm(true);
  };

  const handleEditSuccess = () => {
    refetch();
    setShowEditForm(false);
    setSelectedPlan(null);
  };

  const togglePlanStatus = async (planId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('subscription_plans')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', planId);

      if (error) throw error;
      refetch();
    } catch (err) {
      console.error('Error toggling plan status:', err);
    }
  };

  // Get active features count for each plan
  const getActiveFeaturesCount = (planId: string, appId: string) => {
    const appFeatures = features.filter(f => f.app_id === appId && f.status === 'active');
    const plan = plans.find(p => p.id === planId);
    
    if (!plan || !plan.features) return 0;
    
    // Count features that are both in the plan and active
    return plan.features.filter(featureId => 
      appFeatures.some(f => f.id === featureId)
    ).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Plans Management</h1>
          <p className="text-charcoal-light mt-2">Create and manage subscription plans for your apps</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Plan
        </button>
      </div>

      {/* App Selection */}
      <div className="card p-6">
        <h2 className="text-xl font-bold text-charcoal mb-4">Select Application</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setSelectedAppId('')}
            className={`p-4 rounded-xl border-2 text-left transition-all duration-300 ${
              selectedAppId === ''
                ? 'border-royal-blue bg-sky-blue bg-opacity-10 shadow-lg transform scale-105'
                : 'border-light-gray hover:border-sky-blue hover:bg-sky-blue hover:bg-opacity-5'
            }`}
          >
            <div className="flex items-center mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center mr-3">
                <FileText className="h-6 w-6 text-soft-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal">All Apps</h3>
                <p className="text-sm text-charcoal-light">View all plans</p>
              </div>
            </div>
            <div className="text-sm text-charcoal-light">
              {plans.length} total plans
            </div>
          </button>

          {apps.map((app) => {
            const appPlans = plans.filter(p => p.app_id === app.id);
            return (
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
                    {appPlans.length} plans
                  </div>
                  <StatusIcon 
                    status={app.status} 
                    type="app" 
                    size="sm"
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="card p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
          <input
            type="text"
            placeholder="Search plans..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPlans.map((plan) => {
          const activeFeaturesCount = getActiveFeaturesCount(plan.id, plan.app_id);
          const isActive = plan.status !== 'inactive';
          
          return (
            <div key={plan.id} className={`card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 ${
              plan.is_popular ? 'border-2 border-royal-blue ring-2 ring-sky-blue ring-opacity-20' : ''
            }`}>
              {/* Plan Icon */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  {plan.icon_url ? (
                    <img 
                      src={plan.icon_url} 
                      alt={`${plan.name} icon`}
                      className="w-12 h-12 object-cover rounded-lg mr-4"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-royal-blue to-sky-blue rounded-lg flex items-center justify-center mr-4">
                      <FileText className="h-6 w-6 text-soft-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-charcoal">{plan.name}</h3>
                    <p className="text-sm text-charcoal-light mt-1">{plan.app_name}</p>
                  </div>
                </div>
                {plan.is_popular && (
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                    <span className="text-sm font-medium text-royal-blue">Most Popular</span>
                  </div>
                )}
              </div>

              {/* Active/Inactive Toggle */}
              <div className="flex items-center justify-between mb-4 p-3 bg-light-gray rounded-xl">
                <span className="text-sm font-medium text-charcoal">Plan Status</span>
                <button
                  onClick={() => togglePlanStatus(plan.id, plan.status || 'active')}
                  className="flex items-center"
                >
                  {isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-600 hover:text-green-700" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-gray-500" />
                  )}
                  <span className={`ml-2 text-sm font-medium ${isActive ? 'text-green-600' : 'text-gray-500'}`}>
                    {isActive ? 'Active' : 'Inactive'}
                  </span>
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-charcoal">
                    {plan.currency === 'USD' ? '$' : 
                     plan.currency === 'EUR' ? '€' : 
                     plan.currency === 'GBP' ? '£' : 
                     plan.currency + ' '}
                    {plan.discount_percentage > 0 ? 
                      (plan.price * (1 - plan.discount_percentage / 100)).toFixed(2) : 
                      plan.price
                    }
                  </span>
                  <span className="text-charcoal-light ml-1">/{plan.billing === 'monthly' ? 'mo' : 'yr'}</span>
                  {plan.discount_percentage > 0 && (
                    <span className="ml-2 text-sm line-through text-charcoal-light">
                      {plan.currency === 'USD' ? '$' : 
                       plan.currency === 'EUR' ? '€' : 
                       plan.currency === 'GBP' ? '£' : 
                       plan.currency + ' '}
                      {plan.price}
                    </span>
                  )}
                </div>
                <div className={`inline-flex px-2 py-1 text-xs rounded-full font-medium mt-2 ${getBillingColor(plan.billing)}`}>
                  {plan.billing}
                </div>
                {plan.discount_percentage > 0 && (
                  <div className="inline-flex px-2 py-1 text-xs rounded-full font-medium mt-2 ml-2 bg-green-100 text-green-800">
                    {plan.discount_percentage}% OFF
                  </div>
                )}
              </div>

              <p className="text-charcoal-light text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <div className="flex items-center mb-2">
                  <Users className="h-4 w-4 text-royal-blue mr-2" />
                  <span className="text-sm font-medium text-charcoal">
                    {plan.max_users === -1 ? 'Unlimited' : plan.max_users} users
                  </span>
                </div>
                <div className="flex items-center">
                  <Settings className="h-4 w-4 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-charcoal">
                    {activeFeaturesCount} active features
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-light-gray">
                <div className="flex items-center text-sm text-charcoal-light">
                  <DollarSign className="h-4 w-4 mr-1" />
                  <span>${plan.price * (plan.billing === 'yearly' ? 12 : 1)}/year</span>
                </div>
                <button 
                  onClick={() => handleEditPlan(plan)}
                  className="p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-lg transition-all"
                  title="Edit Plan"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredPlans.length === 0 && (
        <div className="text-center py-12">
          <Plus className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal mb-2">No plans found</h3>
          <p className="text-charcoal-light">
            {selectedAppId 
              ? 'No plans found for the selected app. Create your first plan to get started.'
              : 'Try adjusting your search criteria'
            }
          </p>
        </div>
      )}

      <AddPlanForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
        preselectedAppId={selectedAppId}
      />

      <EditPlanForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedPlan(null);
        }}
        onSuccess={handleEditSuccess}
        plan={selectedPlan}
      />
    </div>
  );
};

export default PlansManagement;