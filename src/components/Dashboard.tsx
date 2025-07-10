import React, { useEffect } from 'react';
import { TrendingUp, Users, Package, DollarSign, Activity, AlertTriangle, FileText, ArrowUp, ArrowDown, Crown, Building, Calendar, BarChart3, CreditCard, UserCheck, UserPlus, RefreshCcw } from 'lucide-react';
import { useApps, useCustomers, useCustomerSubscriptions, usePayments } from '../hooks/useSupabaseData';
import { useProductRevenue } from '../hooks/useCustomerFeatureAccess';
import { usePendingUsers } from '../hooks/useUserManagement';
import { accessLogger } from '../lib/accessLogger'; 

interface DashboardProps {
  onTabChange?: (tab: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onTabChange }) => {
  const { apps } = useApps();
  const { customers } = useCustomers();
  const { subscriptions } = useCustomerSubscriptions();
  const { payments } = usePayments();
  const { productRevenue, loading: productRevenueLoading } = useProductRevenue(); 
  const { pendingUsers, loading: pendingLoading } = usePendingUsers();

  // Log dashboard access
  useEffect(() => {
    accessLogger.logRead('dashboard', undefined, 'Dashboard Page');
  }, []);

  const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const totalCustomers = customers.length;
  const activeApps = apps.filter(app => app.status === 'active').length;

  const recentActivity = [
    { id: 1, action: 'New customer registered', customer: 'TechCorp Solutions', time: '2 minutes ago', type: 'success' },
    { id: 2, action: 'Subscription upgraded', customer: 'Innovate Labs', time: '15 minutes ago', type: 'info' },
    { id: 3, action: 'Payment received', customer: 'CloudTech Systems', time: '1 hour ago', type: 'success' },
    { id: 4, action: 'Feature request submitted', customer: 'DigitalFlow Inc', time: '3 hours ago', type: 'info' },
    { id: 5, action: 'Support ticket opened', customer: 'TechCorp Solutions', time: '5 hours ago', type: 'warning' }
  ];

  // Get unique app names for the product revenue chart
  const appNames = Array.from(new Set(apps.map(app => app.name)));
  const appColors = [
    '#014AAD', // royal-blue
    '#60B9F3', // sky-blue
    '#00D2FF', // bright-cyan
    '#8B5CF6', // purple
    '#10B981', // emerald
    '#F59E0B', // amber
    '#EF4444', // red
    '#6366F1'  // indigo
  ];
  const topApps = apps
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  // Calculate top customers based on total spent and active subscriptions
  const topCustomers = customers
    .map(customer => {
      const customerSubs = subscriptions.filter(sub => sub.customer_id === customer.id && sub.status === 'active');
      const customerPayments = payments.filter(payment => payment.customer_id === customer.id);
      const totalRevenue = customerPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const activeSubsCount = customerSubs.length;
      const appNames = customerSubs.map(sub => sub.app_name).filter((name, index, arr) => arr.indexOf(name) === index);
      
      return {
        ...customer,
        totalRevenue,
        activeSubscriptions: activeSubsCount,
        appNames: appNames.slice(0, 2), // Show max 2 app names
        totalApps: appNames.length
      };
    })
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 4);

  // Generate sample monthly trend data (in a real app, this would come from your API)
  const monthlyTrends = {
    revenue: [
      { month: 'Jul', value: 45000, growth: 8.2 },
      { month: 'Aug', value: 52000, growth: 15.6 },
      { month: 'Sep', value: 48000, growth: -7.7 },
      { month: 'Oct', value: 58000, growth: 20.8 },
      { month: 'Nov', value: 65000, growth: 12.1 },
      { month: 'Dec', value: totalRevenue, growth: 18.5 }
    ],
    customers: [
      { month: 'Jul', value: 120, growth: 5.3 },
      { month: 'Aug', value: 135, growth: 12.5 },
      { month: 'Sep', value: 142, growth: 5.2 },
      { month: 'Oct', value: 158, growth: 11.3 },
      { month: 'Nov', value: 167, growth: 5.7 },
      { month: 'Dec', value: totalCustomers, growth: 15.3 }
    ],
    subscriptions: [
      { month: 'Jul', value: 85, growth: 7.8 },
      { month: 'Aug', value: 92, growth: 8.2 },
      { month: 'Sep', value: 98, growth: 6.5 },
      { month: 'Oct', value: 105, growth: 7.1 },
      { month: 'Nov', value: 112, growth: 6.7 },
      { month: 'Dec', value: activeSubscriptions, growth: 10.2 }
    ]
  };

  const MetricCard = ({ title, value, change, icon: Icon, color, trend }: any) => (
    <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 rounded-2xl bg-gradient-to-br ${color}`}>
          <Icon className="h-7 w-7 text-soft-white" />
        </div>
        <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {trend === 'up' ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
          {change}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-charcoal mb-1">{value}</p>
        <p className="text-charcoal-light font-medium">{title}</p>
      </div>
    </div>
  );

  const TrendChart = ({ data, title, color, icon: Icon, prefix = '' }: any) => {
    const maxValue = Math.max(...data.map((d: any) => d.value));
    const currentGrowth = data[data.length - 1]?.growth || 0;
    
    return (
      <div className="bg-light-gray rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${color} mr-4`}>
              <Icon className="h-6 w-6 text-soft-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-charcoal">{title}</h4>
              <div className={`flex items-center text-sm font-medium ${
                currentGrowth >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {currentGrowth >= 0 ? <ArrowUp className="h-4 w-4 mr-1" /> : <ArrowDown className="h-4 w-4 mr-1" />}
                {Math.abs(currentGrowth)}% vs last month
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-charcoal">{prefix}{data[data.length - 1]?.value.toLocaleString()}</p>
            <p className="text-sm text-charcoal-light">Current</p>
          </div>
        </div>
        
        <div className="flex items-end justify-between h-32 mb-4">
          {data.map((item: any, index: number) => {
            const height = (item.value / maxValue) * 100;
            const isLast = index === data.length - 1;
            return (
              <div key={item.month} className="flex flex-col items-center flex-1">
                <div className="w-full flex justify-center mb-2">
                  <div
                    className={`w-6 rounded-t-lg transition-all duration-500 ${
                      isLast 
                        ? `bg-gradient-to-t ${color.replace('from-', 'from-').replace('to-', 'to-')}` 
                        : 'bg-gray-300'
                    }`}
                    style={{ height: `${height}%` }}
                  ></div>
                </div>
                <span className="text-xs font-medium text-charcoal-light">{item.month}</span>
              </div>
            );
          })}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xs text-charcoal-light">6M Avg</p>
            <p className="font-semibold text-charcoal text-sm">
              {prefix}{Math.round(data.reduce((sum: number, item: any) => sum + item.value, 0) / data.length).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-charcoal-light">Best Month</p>
            <p className="font-semibold text-charcoal text-sm">
              {prefix}{Math.max(...data.map((d: any) => d.value)).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-xs text-charcoal-light">Growth Rate</p>
            <p className={`font-semibold text-sm ${currentGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {currentGrowth >= 0 ? '+' : ''}{currentGrowth}%
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-royal-blue to-sky-blue rounded-3xl p-8 text-soft-white">
        <h1 className="text-4xl font-bold mb-3">Welcome to your Dashboard</h1>
        <p className="text-sky-blue-light text-lg">Here's what's happening with your SaaS platform today.</p>
      </div>

      {/* Pending Users Alert */}
      {pendingUsers.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <UserPlus className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <span className="font-medium">Attention needed!</span> {pendingUsers.length} new user{pendingUsers.length > 1 ? 's' : ''} pending approval.
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => onTabChange && onTabChange('users')}
                  className="inline-flex bg-yellow-100 px-2 py-1 text-xs font-semibold rounded-md text-yellow-800 hover:bg-yellow-200"
                >
                  <UserCheck className="h-4 w-4 mr-1" />
                  Review Users
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          change="+12.5%"
          icon={DollarSign}
          color="from-green-500 to-emerald-600"
          trend="up"
        />
        <MetricCard
          title="Active Subscriptions"
          value={activeSubscriptions}
          change="+8.2%"
          icon={Activity}
          color="from-royal-blue to-sky-blue"
          trend="up"
        />
        <MetricCard
          title="Total Customers"
          value={totalCustomers}
          change="+15.3%"
          icon={Users}
          color="from-purple-500 to-purple-600"
          trend="up"
        />
        <MetricCard
          title="Active Apps"
          value={activeApps}
          change="-2.1%"
          icon={Package}
          color="from-orange-500 to-orange-600"
          trend="down"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Performing Apps */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
              <TrendingUp className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Top Performing Apps</h3>
          </div>
          <div className="space-y-4">
            {topApps.map((app, index) => (
              <div key={app.id} className="flex items-center justify-between p-4 bg-light-gray rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-soft-white font-bold text-sm ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 
                    index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 
                    'bg-gradient-to-br from-royal-blue to-sky-blue'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-charcoal">{app.name}</p>
                    <p className="text-sm text-charcoal-light">{app.subscribers} subscribers</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal">${app.revenue.toLocaleString()}</p>
                  <div className={`inline-flex px-3 py-1 text-xs rounded-full font-medium ${
                    app.status === 'active' ? 'badge-active' :
                    app.status === 'maintenance' ? 'badge-maintenance' :
                    'badge-inactive'
                  }`}>
                    {app.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
              <Crown className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Top Customers</h3>
          </div>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="p-4 bg-light-gray rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-soft-white font-bold text-sm ${
                      index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' : 
                      'bg-gradient-to-br from-purple-500 to-purple-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="ml-4">
                      <p className="font-semibold text-charcoal">{customer.company}</p>
                      <p className="text-sm text-charcoal-light">{customer.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-charcoal">${customer.totalRevenue.toLocaleString()}</p>
                    <p className="text-xs text-charcoal-light">Total Revenue</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-charcoal-light">
                    <Activity className="h-4 w-4 mr-1" />
                    <span>{customer.activeSubscriptions} active subs</span>
                  </div>
                  <div className="flex items-center text-charcoal-light">
                    <Package className="h-4 w-4 mr-1" />
                    <span>{customer.totalApps} apps</span>
                  </div>
                </div>
                {customer.appNames.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1">
                    {customer.appNames.map((appName, idx) => (
                      <span key={idx} className="px-2 py-1 bg-sky-blue bg-opacity-20 text-royal-blue text-xs rounded-full font-medium">
                        {appName}
                      </span>
                    ))}
                    {customer.totalApps > 2 && (
                      <span className="px-2 py-1 bg-light-gray text-charcoal-light text-xs rounded-full font-medium">
                        +{customer.totalApps - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
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
                  activity.type === 'success' ? 'bg-green-400' :
                  activity.type === 'info' ? 'bg-sky-blue' :
                  'bg-yellow-400'
                }`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-charcoal font-medium">{activity.action}</p>
                  <p className="text-charcoal-light">{activity.customer}</p>
                  <p className="text-xs text-charcoal-light mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends Charts */}
      <div className="card p-8">
        <div className="flex items-center mb-8">
          <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
            <BarChart3 className="h-6 w-6 text-soft-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-charcoal">Monthly Trends</h3>
            <p className="text-charcoal-light">Business metrics and product performance over the last 6 months</p>
          </div>
        </div>
        
        {/* Product-wise Revenue Chart */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h4 className="text-xl font-bold text-charcoal">Product-wise Monthly Revenue</h4>
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center px-3 py-1 text-sm text-royal-blue hover:text-sky-blue transition-colors"
            >
              <RefreshCcw className="h-4 w-4 mr-1" />
              Refresh
            </button>
          </div>
          <div className="bg-light-gray rounded-2xl p-6">
            <div className="h-64 relative">
              {productRevenueLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-royal-blue mx-auto mb-4"></div>
                    <p className="text-charcoal-light">Loading revenue data...</p>
                  </div>
                </div>
              ) : productRevenue.length > 0 ? (
                <div className="w-full h-full">
                  {/* Chart Legend */}
                  <div className="flex flex-wrap gap-4 mb-4">
                    {appNames.map((appName, index) => (
                      <div key={appName} className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: appColors[index % appColors.length] }}
                        ></div>
                        <span className="text-xs font-medium text-charcoal">{appName}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Line Chart */}
                  <div className="relative h-48">
                    <svg className="w-full h-full" viewBox="0 0 800 200">
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <line
                          key={i}
                          x1="60"
                          y1={40 + (i * 32)}
                          x2="740"
                          y2={40 + (i * 32)}
                          stroke="#E5E7EB"
                          strokeWidth="1"
                        />
                      ))}
                      
                      {/* Y-axis labels */}
                      {[0, 1, 2, 3, 4].map(i => {
                        const maxRevenue = Math.max(...productRevenue.flatMap(month => 
                          appNames.map(app => month[app] || 0)
                        ));
                        const value = maxRevenue - (i * maxRevenue / 4);
                        return (
                          <text
                            key={i}
                            x="50"
                            y={45 + (i * 32)}
                            textAnchor="end"
                            className="text-xs fill-charcoal-light"
                          >
                            ${Math.round(value).toLocaleString()}
                          </text>
                        );
                      })}
                      
                      {/* X-axis labels */}
                      {productRevenue.map((month, index) => (
                        <text
                          key={index}
                          x={60 + (index * (680 / (productRevenue.length - 1)))}
                          y="185"
                          textAnchor="middle"
                          className="text-xs fill-charcoal-light"
                        >
                          {month.month}
                        </text>
                      ))}
                      
                      {/* Revenue lines for each app */}
                      {appNames.map((appName, appIndex) => {
                        const maxRevenue = Math.max(...productRevenue.flatMap(month => 
                          appNames.map(app => month[app] || 0)
                        ));
                        
                        const points = productRevenue.map((month, monthIndex) => {
                          const x = 60 + (monthIndex * (680 / (productRevenue.length - 1)));
                          const revenue = month[appName] || 0;
                          const y = 168 - ((revenue / maxRevenue) * 128);
                          return `${x},${y}`;
                        }).join(' ');
                        
                        return (
                          <g key={appName}>
                            <polyline
                              points={points}
                              fill="none"
                              stroke={appColors[appIndex % appColors.length]}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            {/* Data points */}
                            {productRevenue.map((month, monthIndex) => {
                              const x = 60 + (monthIndex * (680 / (productRevenue.length - 1)));
                              const revenue = month[appName] || 0;
                              const y = 168 - ((revenue / maxRevenue) * 128);
                              return (
                                <circle
                                  key={monthIndex}
                                  cx={x}
                                  cy={y}
                                  r="3"
                                  fill={appColors[appIndex % appColors.length]}
                                  className="hover:r-5 transition-all cursor-pointer"
                                >
                                  <title>{appName}: ${revenue.toLocaleString()} in {month.month}</title>
                                </circle>
                              );
                            })}
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                  
                  {/* Summary Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-300">
                    <div className="text-center">
                      <p className="text-xs text-charcoal-light">Total Revenue (6M)</p>
                      <p className="text-sm font-semibold text-charcoal">
                        ${productRevenue.reduce((sum, month) => 
                          sum + appNames.reduce((appSum, app) => appSum + (month[app] || 0), 0), 0
                        ).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-charcoal-light">Best Performing</p>
                      <p className="text-sm font-semibold text-charcoal">
                        {appNames.reduce((best, app) => {
                          const appTotal = productRevenue.reduce((sum, month) => sum + (month[app] || 0), 0);
                          const bestTotal = productRevenue.reduce((sum, month) => sum + (month[best] || 0), 0);
                          return appTotal > bestTotal ? app : best;
                        }, appNames[0] || 'N/A')}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-charcoal-light">Avg Growth</p>
                      <p className="text-sm font-semibold text-green-600">+12.3%</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
                    <p className="text-charcoal-light">No revenue data available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Other Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <TrendChart
            data={monthlyTrends.revenue}
            title="Revenue Growth"
            color="from-green-500 to-emerald-600"
            icon={DollarSign}
            prefix="$"
          />
          
          <TrendChart
            data={monthlyTrends.customers}
            title="Customer Growth"
            color="from-purple-500 to-purple-600"
            icon={Users}
          />
          
          <TrendChart
            data={monthlyTrends.subscriptions}
            title="Subscription Growth"
            color="from-royal-blue to-sky-blue"
            icon={CreditCard}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
            <FileText className="h-6 w-6 text-soft-white" />
          </div>
          <h3 className="text-xl font-bold text-charcoal">Quick Actions</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center">
            <Package className="h-5 w-5 mr-2" />
            Add New App
          </button>
          <button className="btn-secondary flex items-center justify-center">
            <Users className="h-5 w-5 mr-2" />
            Add Customer
          </button>
          <button className="btn-accent flex items-center justify-center">
            <FileText className="h-5 w-5 mr-2" />
            Create Plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;