import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, Users, Package, CreditCard, Loader2 } from 'lucide-react';
import { useApps, useCustomers, useCustomerSubscriptions, usePayments } from '../hooks/useSupabaseData';
import StatusIcon from './common/StatusIcon';

const Analytics: React.FC = () => {
  const { apps, loading: appsLoading } = useApps();
  const { customers, loading: customersLoading } = useCustomers();
  const { subscriptions, loading: subscriptionsLoading } = useCustomerSubscriptions();
  const { payments, loading: paymentsLoading } = usePayments();

  const loading = appsLoading || customersLoading || subscriptionsLoading || paymentsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const monthlyRevenue = payments
    .filter(payment => new Date(payment.payment_date).getMonth() === new Date().getMonth())
    .reduce((sum, payment) => sum + payment.amount, 0);
  
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const trialSubscriptions = subscriptions.filter(sub => sub.status === 'trial').length;

  const appPerformance = apps.map(app => {
    const appSubs = subscriptions.filter(sub => sub.app_id === app.id);
    const revenue = appSubs.reduce((sum, sub) => sum + sub.price, 0);
    return {
      ...app,
      subscriptionCount: appSubs.length,
      monthlyRevenue: revenue
    };
  }).sort((a, b) => b.monthlyRevenue - a.monthlyRevenue);

  const recentPayments = payments
    .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Insights and performance metrics for your SaaS platform</p>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+15.3%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">${totalRevenue.toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Total Revenue</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex items-center text-blue-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+8.2%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">${monthlyRevenue.toLocaleString()}</p>
            <p className="text-gray-600 text-sm">Monthly Revenue</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-purple-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+12.1%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{activeSubscriptions}</p>
            <p className="text-gray-600 text-sm">Active Subscriptions</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center text-orange-600">
              <TrendingDown className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">-2.1%</span>
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{trialSubscriptions}</p>
            <p className="text-gray-600 text-sm">Trial Users</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">App Performance</h3>
          <div className="space-y-4">
            {appPerformance.map((app, index) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                    index === 0 ? 'bg-blue-600' : index === 1 ? 'bg-green-600' : index === 2 ? 'bg-purple-600' : 'bg-gray-600'
                  }`}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div className="ml-4">
                    <p className="font-medium text-gray-900">{app.name}</p>
                    <p className="text-sm text-gray-600">{app.subscriptionCount} subscriptions</p>
                  </div>
                </div>
                <div className="text-right flex items-center">
                  <div className="mr-3">
                    <p className="font-semibold text-gray-900">${app.monthlyRevenue}/mo</p>
                  </div>
                  <StatusIcon 
                    status={app.status} 
                    type="app" 
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Payments</h3>
          <div className="space-y-4">
            {recentPayments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center">
                  <StatusIcon 
                    status={payment.status} 
                    type="payment" 
                    size="sm"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{payment.customer_company || 'Unknown'}</p>
                    <p className="text-sm text-gray-600">{payment.app_name} - {payment.plan_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${payment.amount}</p>
                  <p className="text-xs text-gray-500">{new Date(payment.payment_date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Subscription Status Overview */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Subscription Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {['active', 'trial', 'cancelled', 'expired'].map((status) => {
            const count = subscriptions.filter(sub => sub.status === status).length;
            const percentage = subscriptions.length > 0 ? (count / subscriptions.length * 100).toFixed(1) : '0';
            
            return (
              <div key={status} className="text-center">
                <div className="mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-3">
                  <StatusIcon 
                    status={status} 
                    type="subscription" 
                    size="lg"
                    showTooltip={false}
                  />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{count}</div>
                <p className="font-medium text-gray-900 capitalize">{status}</p>
                <p className="text-sm text-gray-600">{percentage}% of total</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;