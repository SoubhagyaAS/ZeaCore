import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Building, 
  Mail, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Users,
  BarChart3,
  PieChart,
  Loader2,
  Edit,
  Phone,
  Globe
} from 'lucide-react';
import { useCustomers, useCustomerSubscriptions, usePayments, useApps } from '../hooks/useSupabaseData';
import CompanyLogo from './common/CompanyLogo';
import StatusIcon from './common/StatusIcon';
import AppLogo from './common/AppLogo';

interface CustomerDashboardProps {
  customerId: string | null;
  onBack: () => void;
}

const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ customerId, onBack }) => {
  const { customers, loading: customersLoading } = useCustomers();
  const { subscriptions, loading: subscriptionsLoading } = useCustomerSubscriptions();
  const { payments, loading: paymentsLoading } = usePayments();
  const { apps } = useApps();

  const loading = customersLoading || subscriptionsLoading || paymentsLoading;

  if (!customerId) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">No Customer Selected</h3>
        <p className="text-charcoal-light">Please select a customer to view their dashboard</p>
        <button onClick={onBack} className="btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading customer dashboard...</span>
      </div>
    );
  }

  const customer = customers.find(c => c.id === customerId);
  
  if (!customer) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">Customer Not Found</h3>
        <p className="text-charcoal-light">The selected customer could not be found</p>
        <button onClick={onBack} className="btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </button>
      </div>
    );
  }

  // Filter data for this customer
  const customerSubscriptions = subscriptions.filter(sub => sub.customer_id === customerId);
  const customerPayments = payments.filter(payment => payment.customer_id === customerId);

  // Calculate metrics
  const totalSpent = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const activeSubscriptions = customerSubscriptions.filter(sub => sub.status === 'active');
  const monthlyRecurring = activeSubscriptions.reduce((sum, sub) => 
    sum + (sub.billing === 'monthly' ? sub.price : sub.price / 12), 0
  );
  const yearlyRecurring = activeSubscriptions.reduce((sum, sub) => 
    sum + (sub.billing === 'yearly' ? sub.price : sub.price * 12), 0
  );

  // Payment history for the last 6 months
  const last6Months = Array.from({ length: 6 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return {
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      year: date.getFullYear(),
      payments: customerPayments.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        return paymentDate.getMonth() === date.getMonth() && 
               paymentDate.getFullYear() === date.getFullYear();
      })
    };
  }).reverse();

  const monthlyPaymentData = last6Months.map(month => ({
    month: month.month,
    amount: month.payments.reduce((sum, p) => sum + p.amount, 0),
    count: month.payments.length
  }));

  // Subscription status breakdown
  const subscriptionStatusData = [
    { status: 'active', count: customerSubscriptions.filter(s => s.status === 'active').length, color: 'bg-green-500' },
    { status: 'trial', count: customerSubscriptions.filter(s => s.status === 'trial').length, color: 'bg-blue-500' },
    { status: 'cancelled', count: customerSubscriptions.filter(s => s.status === 'cancelled').length, color: 'bg-red-500' },
    { status: 'expired', count: customerSubscriptions.filter(s => s.status === 'expired').length, color: 'bg-gray-500' }
  ].filter(item => item.count > 0);

  // Recent activity
  const recentActivity = [
    ...customerPayments.slice(0, 3).map(payment => ({
      id: payment.id,
      type: 'payment',
      description: `Payment of $${payment.amount} received`,
      date: payment.payment_date,
      status: payment.status
    })),
    ...customerSubscriptions.slice(0, 2).map(sub => ({
      id: sub.id,
      type: 'subscription',
      description: `Subscription to ${sub.app_name} - ${sub.plan_name}`,
      date: sub.created_at,
      status: sub.status
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  // Apps used by customer
  const customerApps = [...new Set(customerSubscriptions.map(sub => sub.app_id))]
    .map(appId => {
      const app = apps.find(a => a.id === appId);
      const appSubs = customerSubscriptions.filter(sub => sub.app_id === appId);
      const appRevenue = appSubs.reduce((sum, sub) => sum + sub.price, 0);
      return {
        ...app,
        subscriptionCount: appSubs.length,
        revenue: appRevenue,
        status: appSubs.some(sub => sub.status === 'active') ? 'active' : 'inactive'
      };
    })
    .filter(app => app.id);

  const maxPaymentAmount = Math.max(...monthlyPaymentData.map(d => d.amount), 1);

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
            <CompanyLogo 
              src={customer.logo_url} 
              companyName={customer.company} 
              size="xl"
              className="mr-6"
            />
            <div>
              <h1 className="text-4xl font-bold text-charcoal mb-2">{customer.company}</h1>
              <div className="flex items-center space-x-6 text-charcoal-light">
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  <span>{customer.name}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  <span>{customer.email}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <StatusIcon 
            status={customer.status} 
            type="customer" 
            size="lg"
          />
          <button className="btn-secondary flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Customer
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex items-center text-green-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+12.5%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">${totalSpent.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Total Spent</p>
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
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex items-center text-purple-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+15.3%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">${monthlyRecurring.toFixed(0)}</p>
            <p className="text-charcoal-light font-medium">Monthly Recurring</p>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-xl">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex items-center text-orange-600">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">+5.1%</span>
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal">{customerApps.length}</p>
            <p className="text-charcoal-light font-medium">Apps Used</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Payment History Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-charcoal">Payment History</h3>
              <p className="text-charcoal-light">Monthly payment trends over the last 6 months</p>
            </div>
            <div className="flex items-center text-sm text-charcoal-light">
              <BarChart3 className="h-4 w-4 mr-2" />
              Last 6 Months
            </div>
          </div>
          
          <div className="flex items-end justify-between h-64 mb-4">
            {monthlyPaymentData.map((data, index) => {
              const height = (data.amount / maxPaymentAmount) * 100;
              return (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div className="w-full flex justify-center mb-2">
                    <div
                      className="w-8 bg-gradient-to-t from-royal-blue to-sky-blue rounded-t-lg transition-all duration-500 hover:from-sky-blue hover:to-bright-cyan"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${data.month}: $${data.amount} (${data.count} payments)`}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-charcoal-light">{data.month}</span>
                </div>
              );
            })}
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center border-t border-light-gray pt-4">
            <div>
              <p className="text-xs text-charcoal-light">Total Payments</p>
              <p className="font-semibold text-charcoal">{customerPayments.length}</p>
            </div>
            <div>
              <p className="text-xs text-charcoal-light">Average Payment</p>
              <p className="font-semibold text-charcoal">
                ${customerPayments.length > 0 ? (totalSpent / customerPayments.length).toFixed(0) : '0'}
              </p>
            </div>
            <div>
              <p className="text-xs text-charcoal-light">Last Payment</p>
              <p className="font-semibold text-charcoal">
                {customerPayments.length > 0 
                  ? new Date(customerPayments[0].payment_date).toLocaleDateString()
                  : 'None'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Subscription Status Breakdown */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
              <PieChart className="h-6 w-6 text-soft-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">Subscription Status</h3>
              <p className="text-charcoal-light">Current subscription breakdown</p>
            </div>
          </div>

          <div className="space-y-4">
            {subscriptionStatusData.map((item, index) => {
              const percentage = customerSubscriptions.length > 0 
                ? (item.count / customerSubscriptions.length * 100).toFixed(1) 
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

          {subscriptionStatusData.length === 0 && (
            <div className="text-center py-8">
              <CreditCard className="h-8 w-8 text-charcoal-light mx-auto mb-2" />
              <p className="text-charcoal-light">No subscriptions yet</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Apps Used */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
              <Package className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Apps & Services</h3>
          </div>
          
          <div className="space-y-4">
            {customerApps.map((app) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-light-gray rounded-xl">
                <div className="flex items-center">
                  <AppLogo 
                    src={app.logo_url} 
                    appName={app.name} 
                    size="md" 
                    className="mr-4"
                  />
                  <div>
                    <p className="font-semibold text-charcoal">{app.name}</p>
                    <p className="text-sm text-charcoal-light">{app.subscriptionCount} subscription(s)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal">${app.revenue}/mo</p>
                  <StatusIcon 
                    status={app.status} 
                    type="app" 
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>

          {customerApps.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-charcoal-light mx-auto mb-2" />
              <p className="text-charcoal-light">No apps subscribed yet</p>
            </div>
          )}
        </div>

        {/* Recent Activity */}
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
                  activity.status === 'trial' ? 'bg-blue-400' :
                  'bg-gray-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-charcoal font-medium">{activity.description}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-3 w-3 text-charcoal-light mr-1" />
                    <p className="text-xs text-charcoal-light">
                      {new Date(activity.date).toLocaleDateString()} at {new Date(activity.date).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {recentActivity.length === 0 && (
            <div className="text-center py-8">
              <Activity className="h-8 w-8 text-charcoal-light mx-auto mb-2" />
              <p className="text-charcoal-light">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Subscriptions Table */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-charcoal">Subscription Details</h3>
            <p className="text-charcoal-light">Complete list of customer subscriptions</p>
          </div>
          <div className="text-sm text-charcoal-light">
            {customerSubscriptions.length} total subscriptions
          </div>
        </div>

        {customerSubscriptions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-gray">
              <thead className="bg-light-gray">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    App & Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Billing
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Features
                  </th>
                </tr>
              </thead>
              <tbody className="bg-soft-white divide-y divide-light-gray">
                {customerSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-charcoal">{subscription.app_name}</div>
                        <div className="text-sm text-charcoal-light">{subscription.plan_name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusIcon 
                        status={subscription.status} 
                        type="subscription" 
                        size="sm"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-charcoal">
                        <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                        {subscription.price === 0 ? 'Free' : `$${subscription.price}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex px-2 py-1 text-xs rounded-full font-medium ${
                        subscription.billing === 'yearly' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {subscription.billing}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                      <div>
                        <div>{new Date(subscription.start_date).toLocaleDateString()}</div>
                        <div className="text-xs">to {new Date(subscription.end_date).toLocaleDateString()}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {subscription.enabled_features.slice(0, 2).map((feature: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-sky-blue bg-opacity-20 text-royal-blue text-xs rounded-full font-medium">
                            {feature}
                          </span>
                        ))}
                        {subscription.enabled_features.length > 2 && (
                          <span className="px-2 py-1 bg-light-gray text-charcoal-light text-xs rounded-full font-medium">
                            +{subscription.enabled_features.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <CreditCard className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
            <h3 className="text-lg font-medium text-charcoal mb-2">No Subscriptions</h3>
            <p className="text-charcoal-light">This customer hasn't subscribed to any services yet</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDashboard;