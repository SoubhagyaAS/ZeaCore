import React from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Receipt, 
  CreditCard, 
  RefreshCcw, 
  AlertTriangle, 
  BarChart3, 
  PieChart, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Users,
  Target,
  Activity,
  Shield,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon
} from 'lucide-react';
import { useFinancialSummary, useInvoices, usePaymentTransactions } from '../../hooks/useFinance';

const FinanceDashboard: React.FC = () => {
  const { summary, loading: summaryLoading } = useFinancialSummary();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { payments, loading: paymentsLoading } = usePaymentTransactions();

  const loading = summaryLoading || invoicesLoading || paymentsLoading;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading finance dashboard...</span>
      </div>
    );
  }

  // Get recent invoices and payments
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
    .slice(0, 5);

  const recentPayments = [...payments]
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, 5);

  // Calculate due invoices
  const dueInvoices = invoices.filter(
    invoice => (invoice.status === 'sent' || invoice.status === 'overdue') && 
    new Date(invoice.due_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  );

  // Get monthly recurring revenue
  const mrr = summary.monthlyRecurringRevenue + summary.yearlyRecurringRevenue;

  // Enhanced calculations for new metrics
  const totalCustomers = 156; // This would come from your customer data
  const churnedCustomers = 12;
  const newCustomers = 23;
  const churnRate = ((churnedCustomers / totalCustomers) * 100).toFixed(1);
  const growthRate = ((newCustomers / totalCustomers) * 100).toFixed(1);

  // Cash flow data (mock data - replace with real calculations)
  const cashFlowData = [
    { month: 'Jul', inflow: 45000, outflow: 12000, net: 33000 },
    { month: 'Aug', inflow: 52000, outflow: 15000, net: 37000 },
    { month: 'Sep', inflow: 48000, outflow: 18000, net: 30000 },
    { month: 'Oct', inflow: 58000, outflow: 14000, net: 44000 },
    { month: 'Nov', inflow: 65000, outflow: 16000, net: 49000 },
    { month: 'Dec', inflow: summary.totalRevenue, outflow: 20000, net: summary.totalRevenue - 20000 }
  ];

  // Payment method distribution
  const paymentMethods = [
    { method: 'Credit Card', percentage: 65, amount: summary.totalRevenue * 0.65 },
    { method: 'Bank Transfer', percentage: 20, amount: summary.totalRevenue * 0.20 },
    { method: 'PayPal', percentage: 10, amount: summary.totalRevenue * 0.10 },
    { method: 'Other', percentage: 5, amount: summary.totalRevenue * 0.05 }
  ];

  // Revenue forecasting (simple linear projection)
  const last3Months = summary.revenueByMonth.slice(-3);
  const avgGrowth = last3Months.length > 1 ? 
    (last3Months[last3Months.length - 1].revenue - last3Months[0].revenue) / (last3Months.length - 1) : 0;
  const projectedRevenue = summary.totalRevenue + (avgGrowth * 3);

  // Customer payment behavior
  const onTimePayments = payments.filter(p => p.status === 'completed').length;
  const latePayments = invoices.filter(i => i.status === 'overdue').length;
  const paymentReliability = ((onTimePayments / (onTimePayments + latePayments)) * 100).toFixed(1);

  // Tax summary
  const totalTaxCollected = invoices.reduce((sum, inv) => sum + (inv.tax_amount || 0), 0);
  const totalDiscounts = invoices.reduce((sum, inv) => sum + (inv.discount_amount || 0), 0);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-royal-blue to-sky-blue rounded-3xl p-8 text-soft-white">
        <h1 className="text-4xl font-bold mb-3">Finance Dashboard</h1>
        <p className="text-sky-blue-light text-lg">Financial overview and key metrics for your SaaS platform.</p>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
              <TrendingUp className="h-4 w-4 mr-1" />
              +15.2%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">${summary.totalRevenue.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Total Revenue</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-royal-blue to-sky-blue">
              <Receipt className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
              <TrendingUp className="h-4 w-4 mr-1" />
              +8.7%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">${summary.outstandingAmount.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Outstanding</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600">
              <CreditCard className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
              <TrendingUp className="h-4 w-4 mr-1" />
              +12.3%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">${mrr.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Monthly Recurring</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600">
              <AlertTriangle className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
              <TrendingDown className="h-4 w-4 mr-1" />
              -2.1%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{summary.overdueInvoices}</p>
            <p className="text-charcoal-light font-medium">Overdue Invoices</p>
          </div>
        </div>
      </div>

      {/* New Enhanced Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600">
              <Target className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
              <ArrowUpRight className="h-4 w-4 mr-1" />
              +{growthRate}%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{totalCustomers}</p>
            <p className="text-charcoal-light font-medium">Total Customers</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600">
              <Activity className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-teal-100 text-teal-700">
              <CheckCircle className="h-4 w-4 mr-1" />
              {paymentReliability}%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{paymentReliability}%</p>
            <p className="text-charcoal-light font-medium">Payment Reliability</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-pink-600">
              <Zap className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-pink-100 text-pink-700">
              <TrendingUpIcon className="h-4 w-4 mr-1" />
              +{((projectedRevenue - summary.totalRevenue) / summary.totalRevenue * 100).toFixed(1)}%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">${projectedRevenue.toLocaleString()}</p>
            <p className="text-charcoal-light font-medium">Projected Revenue</p>
          </div>
        </div>

        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600">
              <Shield className="h-7 w-7 text-soft-white" />
            </div>
            <div className="flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
              <Percent className="h-4 w-4 mr-1" />
              {churnRate}%
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-charcoal mb-1">{churnRate}%</p>
            <p className="text-charcoal-light font-medium">Churn Rate</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cash Flow Chart */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl mr-4">
              <BarChart3 className="h-6 w-6 text-soft-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">Cash Flow Analysis</h3>
              <p className="text-charcoal-light">Inflows vs Outflows over the last 6 months</p>
            </div>
          </div>
          
          <div className="h-64 flex items-end justify-between">
            {cashFlowData.map((data, index) => {
              const maxValue = Math.max(...cashFlowData.map(d => Math.max(d.inflow, d.outflow)), 1);
              const inflowHeight = (data.inflow / maxValue) * 100;
              const outflowHeight = (data.outflow / maxValue) * 100;
              
              return (
                <div key={index} className="flex flex-col items-center flex-1 mx-1">
                  <div className="w-full flex justify-center mb-2 space-x-1">
                    <div
                      className="w-3 bg-gradient-to-t from-green-500 to-emerald-600 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(inflowHeight, 5)}%` }}
                      title={`Inflow: $${data.inflow.toLocaleString()}`}
                    ></div>
                    <div
                      className="w-3 bg-gradient-to-t from-red-500 to-red-600 rounded-t-lg transition-all duration-500"
                      style={{ height: `${Math.max(outflowHeight, 5)}%` }}
                      title={`Outflow: $${data.outflow.toLocaleString()}`}
                    ></div>
                  </div>
                  <span className="text-xs font-medium text-charcoal-light">{data.month}</span>
                  <span className={`text-xs font-bold ${data.net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${data.net.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="flex justify-center space-x-6 mt-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span className="text-sm text-charcoal-light">Inflow</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
              <span className="text-sm text-charcoal-light">Outflow</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-blue-500 rounded mr-2"></div>
              <span className="text-sm text-charcoal-light">Net</span>
            </div>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-4">
              <PieChart className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Payment Methods</h3>
          </div>

          <div className="space-y-4">
            {paymentMethods.map((method, index) => {
              const colors = [
                'bg-royal-blue',
                'bg-sky-blue',
                'bg-purple-500',
                'bg-green-500'
              ];
              
              return (
                <div key={method.method} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]} mr-3`}></div>
                      <span className="text-charcoal font-medium">{method.method}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-charcoal font-bold">${method.amount.toLocaleString()}</div>
                      <div className="text-xs text-charcoal-light">{method.percentage}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-light-gray rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${colors[index % colors.length]}`}
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tax and Compliance Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl mr-4">
              <Shield className="h-6 w-6 text-soft-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">Tax & Compliance</h3>
              <p className="text-charcoal-light">Tax collections and compliance status</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-light-gray rounded-xl">
              <p className="text-2xl font-bold text-charcoal">${totalTaxCollected.toLocaleString()}</p>
              <p className="text-sm text-charcoal-light">Total Tax Collected</p>
            </div>
            <div className="text-center p-4 bg-light-gray rounded-xl">
              <p className="text-2xl font-bold text-charcoal">${totalDiscounts.toLocaleString()}</p>
              <p className="text-sm text-charcoal-light">Total Discounts</p>
            </div>
            <div className="text-center p-4 bg-green-100 rounded-xl">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-green-800">Compliant</p>
            </div>
            <div className="text-center p-4 bg-blue-100 rounded-xl">
              <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-800">Next Filing: Jan 31</p>
            </div>
          </div>
        </div>

        {/* Customer Behavior Metrics */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl mr-4">
              <Users className="h-6 w-6 text-soft-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-charcoal">Customer Behavior</h3>
              <p className="text-charcoal-light">Payment patterns and customer insights</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-charcoal font-medium">On-time Payments</span>
              </div>
              <div className="text-right">
                <p className="text-charcoal font-bold">{onTimePayments}</p>
                <p className="text-xs text-charcoal-light">{paymentReliability}% rate</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-charcoal font-medium">Late Payments</span>
              </div>
              <div className="text-right">
                <p className="text-charcoal font-bold">{latePayments}</p>
                <p className="text-xs text-charcoal-light">{(100 - parseFloat(paymentReliability)).toFixed(1)}% rate</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
              <div className="flex items-center">
                <ArrowUpRight className="h-5 w-5 text-green-600 mr-3" />
                <span className="text-charcoal font-medium">New Customers</span>
              </div>
              <div className="text-right">
                <p className="text-charcoal font-bold">+{newCustomers}</p>
                <p className="text-xs text-charcoal-light">This month</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-light-gray rounded-xl">
              <div className="flex items-center">
                <ArrowDownRight className="h-5 w-5 text-red-600 mr-3" />
                <span className="text-charcoal font-medium">Churned Customers</span>
              </div>
              <div className="text-right">
                <p className="text-charcoal font-bold">-{churnedCustomers}</p>
                <p className="text-xs text-charcoal-light">This month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Invoices */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
                <Receipt className="h-6 w-6 text-soft-white" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Recent Invoices</h3>
            </div>
            <a href="#" className="text-royal-blue hover:text-sky-blue text-sm font-medium">
              View All
            </a>
          </div>
          
          <div className="space-y-4">
            {recentInvoices.map((invoice) => {
              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'paid':
                    return <CheckCircle className="h-4 w-4 text-green-600" />;
                  case 'draft':
                    return <Receipt className="h-4 w-4 text-gray-600" />;
                  case 'sent':
                    return <Clock className="h-4 w-4 text-blue-600" />;
                  case 'overdue':
                    return <AlertTriangle className="h-4 w-4 text-red-600" />;
                  case 'cancelled':
                    return <XCircle className="h-4 w-4 text-gray-600" />;
                  default:
                    return <Receipt className="h-4 w-4 text-gray-600" />;
                }
              };
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'paid':
                    return 'bg-green-100 text-green-800';
                  case 'draft':
                    return 'bg-gray-100 text-gray-800';
                  case 'sent':
                    return 'bg-blue-100 text-blue-800';
                  case 'overdue':
                    return 'bg-red-100 text-red-800';
                  case 'cancelled':
                    return 'bg-gray-100 text-gray-800';
                  default:
                    return 'bg-gray-100 text-gray-800';
                }
              };
              
              return (
                <div key={invoice.id} className="flex items-center justify-between p-4 bg-light-gray rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 text-royal-blue mr-3" />
                    <div>
                      <p className="font-medium text-charcoal">{invoice.invoice_number}</p>
                      <p className="text-sm text-charcoal-light">{invoice.customer_company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-charcoal">${invoice.total_amount.toFixed(2)}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1 capitalize">{invoice.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-4">
                <CreditCard className="h-6 w-6 text-soft-white" />
              </div>
              <h3 className="text-xl font-bold text-charcoal">Recent Payments</h3>
            </div>
            <a href="#" className="text-royal-blue hover:text-sky-blue text-sm font-medium">
              View All
            </a>
          </div>
          
          <div className="space-y-4">
            {recentPayments.map((payment) => {
              const getStatusIcon = (status: string) => {
                switch (status) {
                  case 'completed':
                    return <CheckCircle className="h-4 w-4 text-green-600" />;
                  case 'pending':
                    return <Clock className="h-4 w-4 text-blue-600" />;
                  case 'failed':
                    return <XCircle className="h-4 w-4 text-red-600" />;
                  case 'refunded':
                    return <RefreshCcw className="h-4 w-4 text-orange-600" />;
                  default:
                    return <CreditCard className="h-4 w-4 text-gray-600" />;
                }
              };
              
              const getStatusColor = (status: string) => {
                switch (status) {
                  case 'completed':
                    return 'bg-green-100 text-green-800';
                  case 'pending':
                    return 'bg-blue-100 text-blue-800';
                  case 'failed':
                    return 'bg-red-100 text-red-800';
                  case 'refunded':
                    return 'bg-orange-100 text-orange-800';
                  default:
                    return 'bg-gray-100 text-gray-800';
                }
              };
              
              return (
                <div key={payment.id} className="flex items-center justify-between p-4 bg-light-gray rounded-xl hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-charcoal">
                        {payment.transaction_reference || payment.id.substring(0, 8)}
                      </p>
                      <p className="text-sm text-charcoal-light">{payment.customer_company}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-charcoal">${payment.amount.toFixed(2)}</p>
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Due Invoices */}
      <div className="card p-6">
        <div className="flex items-center mb-6">
          <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl mr-4">
            <Calendar className="h-6 w-6 text-soft-white" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-charcoal">Upcoming Due Invoices</h3>
            <p className="text-charcoal-light">Invoices due in the next 7 days</p>
          </div>
        </div>
        
        {dueInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-light-gray">
              <thead className="bg-light-gray">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Invoice
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-light uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-soft-white divide-y divide-light-gray">
                {dueInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Receipt className="h-4 w-4 text-royal-blue mr-2" />
                        <div className="text-sm font-medium text-charcoal">{invoice.invoice_number}</div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-charcoal">
                      {invoice.customer_company}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-1 text-charcoal-light" />
                        {new Date(invoice.due_date).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        invoice.status === 'overdue' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {invoice.status === 'overdue' ? (
                          <AlertTriangle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        <span className="capitalize">{invoice.status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right text-sm font-medium text-charcoal">
                      ${invoice.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-charcoal mb-2">No Upcoming Due Invoices</h4>
            <p className="text-charcoal-light">All invoices are either paid or not due soon</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceDashboard;