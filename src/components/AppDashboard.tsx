import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Package, 
  Users, 
  CreditCard, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Calendar,
  BarChart3,
  PieChart,
  Star,
  Building,
  Globe,
  Settings,
  Eye,
  Edit,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useApps, useCustomers, useCustomerSubscriptions, usePayments, useSubscriptionPlans } from '../hooks/useSupabaseData';
import { useAppDashboardData } from '../hooks/useAppDashboard';
import AppLogo from './common/AppLogo';
import CompanyLogo from './common/CompanyLogo';
import StatusIcon from './common/StatusIcon';

interface AppDashboardProps {
  appId: string;
  onBack: () => void;
}

const AppDashboard: React.FC<AppDashboardProps> = ({ appId, onBack }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const { apps, loading: appsLoading } = useApps();
  const { customers } = useCustomers();
  const { subscriptions } = useCustomerSubscriptions();
  const { payments } = usePayments();
  const { plans } = useSubscriptionPlans();
  const { 
    monthlyRevenue, 
    customerGrowth, 
    subscriptionMetrics, 
    loading: dashboardLoading 
  } = useAppDashboardData(appId);

  const loading = appsLoading || dashboardLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading app dashboard...</span>
      </div>
    );
  }

  const app = apps.find(a => a.id === appId);
  
  if (!app) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">App Not Found</h3>
        <p className="text-charcoal-light">The selected app could not be found</p>
        <button onClick={onBack} className="btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Apps
        </button>
      </div>
    );
  }

  // Filter data for this app
  const appSubscriptions = subscriptions.filter(sub => sub.app_id === appId);
  const appPlans = plans.filter(plan => plan.app_id === appId);
  const appPayments = payments.filter(payment => 
    appSubscriptions.some(sub => sub.id === payment.subscription_id)
  );

  // Calculate metrics
  const totalRevenue = appPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const activeSubscriptions = appSubscriptions.filter(sub => sub.status === 'active');
  const monthlyRecurring = activeSubscriptions.reduce((sum, sub) => 
    sum + (sub.billing === 'monthly' ? sub.price : sub.price / 12), 0
  );
  const uniqueCustomers = new Set(appSubscriptions.map(sub => sub.customer_id)).size;

  // Get app customers
  const appCustomerIds = [...new Set(appSubscriptions.map(sub => sub.customer_id))];
  const appCustomers = customers.filter(customer => appCustomerIds.includes(customer.id));

  // Recent activity
  const recentActivity = [
    ...appPayments.slice(0, 3).map(payment => ({
      id: payment.id,
      type: 'payment',
      description: `Payment of $${payment.amount} received`,
      customer: payment.customer_company,
      date: payment.payment_date,
      status: payment.status
    })),
    ...appSubscriptions.slice(0, 2).map(sub => ({
      id: sub.id,
      type: 'subscription',
      description: `New subscription to ${sub.plan_name}`,
      customer: sub.customer_company,
      date: sub.created_at,
      status: sub.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Subscription status breakdown
  const subscriptionStatusData = [
    { status: 'active', count: appSubscriptions.filter(s => s.status === 'active').length, color: 'bg-green-500' },
    { status: 'trial', count: appSubscriptions.filter(s => s.status === 'trial').length, color: 'bg-blue-500' },
    { status: 'cancelled', count: appSubscriptions.filter(s => s.status === 'cancelled').length, color: 'bg-red-500' },
    { status: 'expired', count: appSubscriptions.filter(s => s.status === 'expired').length, color: 'bg-gray-500' }
  ].filter(item => item.count > 0);

  // Plan performance
  const planPerformance = appPlans.map(plan => {
    const planSubs = appSubscriptions.filter(sub => sub.plan_id === plan.id);
    const planRevenue = planSubs.reduce((sum, sub) => sum + sub.price, 0);
    return {
      ...plan,
      subscriptionCount: planSubs.length,
      revenue: planRevenue,
      activeCount: planSubs.filter(sub => sub.status === 'active').length
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const maxMonthlyRevenue = Math.max(...monthlyRevenue.map(d => d.revenue), 1);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'customers':
        return renderCustomersTab();
      case 'subscriptions':
        return renderSubscriptionsTab();
      case 'analytics':
        return renderAnalyticsTab();
      default:
        return renderOverviewTab();
    }
  };

  const renderOverviewTab = () => (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+15.3%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">${totalRevenue.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Total Revenue</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-royal-blue bg-opacity-10 p-3 rounded-xl">
              <CreditCard className="h-6 w-6 text-royal-blue" />
            </div>
            <div className="flex items-center text-royal-blue">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+8.2%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">{activeSubscriptions.length}</p>
            <p className="text-charcoal-light font-medium">Active Subscriptions</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-purple-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+12.1%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">{uniqueCustomers}</p>
            <p className="text-charcoal-light font-medium">Total Customers</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <BarChart3 className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center text-orange-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+5.7%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">${monthlyRecurring.toFixed(0)}</p>
            <p className="text-charcoal-light font-medium">Monthly Recurring</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-charcoal">Monthly Revenue</h3>
              <p className="text-charcoal-light">Revenue trends over the last 6 months</p>
            </div>
          </div>
          
          <div className="flex items-end justify-between h-64 mb-4">
            {monthlyRevenue.map((data, index) => {
              const height = (data.revenue / maxMonthlyRevenue) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div className="w-full flex justify-center mb-2">
                    <div
                      className="w-8 bg-gradient-to-t from-royal-blue to-sky-blue rounded-t-lg transition-all duration-500 hover:from-sky-blue hover:to-bright-cyan"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${data.month}: $${data.revenue.toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-charcoal-light">{data.month}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Subscription Status */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
              <PieChart className="h-6 w-6 text-soft-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">Subscription Status</h3>
              <p className="text-charcoal-light">Current breakdown</p>
            </div>
          </div>

          <div className="space-y-4">
            {subscriptionStatusData.map((item) => {
              const percentage = appSubscriptions.length > 0 
                ? (item.count / appSubscriptions.length * 100).toFixed(1) 
                : '0';
              
              return (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full ${item.color} mr-3`}></div>
                    <span className="text-charcoal font-medium capitalize">{item.status}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-charcoal font-bold">{item.count}</div>
                    <div className="text-xs text-charcoal-light">{percentage}%</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Plan Performance & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
              <Star className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Plan Performance</h3>
          </div>
          
          <div className="space-y-4">
            {planPerformance.map((plan, index) => (
              <div key={plan.id} className="flex items-center justify-between p-4 bg-light-gray rounded-xl">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-500' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-charcoal">{plan.name}</p>
                    <p className="text-sm text-charcoal-light">{plan.activeCount} active subscriptions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal">${plan.revenue.toLocaleString()}</p>
                  <p className="text-xs text-charcoal-light">${plan.price}/{plan.billing}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-bright-cyan to-sky-blue rounded-xl mr-4">
              <Activity className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Recent Activity</h3>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-3 hover:bg-light-gray rounded-xl transition-colors">
                <div className={`w-3 h-3 rounded-full mt-2 ${
                  activity.type === 'payment' ? 'bg-green-400' :
                  activity.status === 'active' ? 'bg-sky-blue' :
                  'bg-gray-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-charcoal font-medium">{activity.description}</p>
                  <p className="text-sm text-charcoal-light">{activity.customer}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-charcoal-light mr-1" />
                    <p className="text-xs text-charcoal-light">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderCustomersTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-charcoal">App Customers</h3>
        <div className="text-sm text-charcoal-light">
          {appCustomers.length} customers using this app
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appCustomers.map((customer) => {
          const customerSubs = appSubscriptions.filter(sub => sub.customer_id === customer.id);
          const customerRevenue = appPayments
            .filter(payment => customerSubs.some(sub => sub.id === payment.subscription_id))
            .reduce((sum, payment) => sum + payment.amount, 0);
          
          return (
            <div key={customer.id} className="card p-6 hover:shadow-2xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <CompanyLogo 
                  src={customer.logo_url} 
                  companyName={customer.company} 
                  size="lg"
                />
                <StatusIcon status={customer.status} type="customer" size="md" />
              </div>

              <div className="mb-4">
                <h4 className="text-lg font-bold text-charcoal mb-1">{customer.company}</h4>
                <p className="text-charcoal-light">{customer.name}</p>
                <p className="text-sm text-charcoal-light">{customer.email}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-light-gray rounded-xl p-3">
                  <div className="flex items-center mb-1">
                    <CreditCard className="h-4 w-4 text-royal-blue mr-1" />
                    <span className="text-xs font-medium text-charcoal-light">Subscriptions</span>
                  </div>
                  <p className="text-lg font-bold text-charcoal">{customerSubs.length}</p>
                </div>
                <div className="bg-light-gray rounded-xl p-3">
                  <div className="flex items-center mb-1">
                    <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                    <span className="text-xs font-medium text-charcoal-light">Revenue</span>
                  </div>
                  <p className="text-lg font-bold text-charcoal">${customerRevenue.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-light-gray">
                <div className="text-xs text-charcoal-light">
                  Customer since {new Date(customer.created_at).toLocaleDateString()}
                </div>
                <button className="p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-lg transition-all">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderSubscriptionsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-bold text-charcoal">App Subscriptions</h3>
        <div className="text-sm text-charcoal-light">
          {appSubscriptions.length} total subscriptions
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-gray">
            <thead className="bg-light-gray">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Plan
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-soft-white divide-y divide-light-gray">
              {appSubscriptions.map((subscription) => (
                <tr key={subscription.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="text-sm font-medium text-charcoal">{subscription.customer_company}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-charcoal">{subscription.plan_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIcon status={subscription.status} type="subscription" size="sm" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      ${subscription.price}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                    <div>
                      <div>{new Date(subscription.start_date).toLocaleDateString()}</div>
                      <div className="text-xs">to {new Date(subscription.end_date).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all">
                        <Edit className="h-4 w-4" />
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
  );

  const renderAnalyticsTab = () => (
    <div className="space-y-8">
      <h3 className="text-2xl font-bold text-charcoal">Analytics & Insights</h3>
      
      {/* Customer Growth Chart */}
      <div className="card p-6">
        <h4 className="text-xl font-bold text-charcoal mb-6">Customer Growth</h4>
        <div className="h-64 flex items-end justify-between">
          {customerGrowth.map((data, index) => {
            const maxCustomers = Math.max(...customerGrowth.map(d => d.customers), 1);
            const height = (data.customers / maxCustomers) * 100;
            return (
              <div key={index} className="flex flex-col items-center flex-1 mx-1">
                <div className="w-full flex justify-center mb-2">
                  <div
                    className="w-8 bg-gradient-to-t from-purple-500 to-purple-600 rounded-t-lg"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${data.month}: ${data.customers} customers`}
                  ></div>
                </div>
                <span className="text-xs font-medium text-charcoal-light">{data.month}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subscription Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-charcoal">{subscriptionMetrics.churnRate}%</p>
            <p className="text-charcoal-light">Churn Rate</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-xl">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-charcoal">${subscriptionMetrics.averageRevenue}</p>
            <p className="text-charcoal-light">Avg Revenue per Customer</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-charcoal">{subscriptionMetrics.averageLifetime} days</p>
            <p className="text-charcoal-light">Avg Customer Lifetime</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-10 rounded-xl transition-all"
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <AppLogo 
              src={app.logo_url} 
              appName={app.name} 
              size="xl"
              className="mr-6"
            />
            <div>
              <h1 className="text-4xl font-bold text-charcoal mb-2">{app.name}</h1>
              <div className="flex items-center space-x-6 text-charcoal-light">
                <div className="flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  <span>{app.category}</span>
                </div>
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2" />
                  <span>v{app.version}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Created {new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIcon status={app.status} type="app" size="lg" />
          <button className="btn-secondary flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            App Settings
          </button>
        </div>
      </div>

      {/* App Description */}
      <div className="card p-6">
        <p className="text-charcoal-light text-lg leading-relaxed">{app.description}</p>
        {app.app_url && (
          <div className="mt-4">
            <a 
              href={app.app_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center text-royal-blue hover:text-sky-blue font-medium"
            >
              <Globe className="h-4 w-4 mr-2" />
              Visit App Website
            </a>
          </div>
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
    </div>
  );
};

export default AppDashboard;