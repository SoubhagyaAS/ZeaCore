import React, { useState } from 'react';
import { Plus, Search, Mail, Building, Calendar, DollarSign, Edit, Loader2, Grid3X3, List, Filter, Users, TrendingUp, Star, Clock, Award, Activity } from 'lucide-react';
import { useCustomers, useCustomerSubscriptions } from '../hooks/useSupabaseData';
import { supabase } from '../lib/supabase';
import AddCustomerForm from './forms/AddCustomerForm';
import EditCustomerForm from './forms/EditCustomerForm';
import CompanyLogo from './common/CompanyLogo';
import StatusIcon from './common/StatusIcon';

interface CustomersManagementProps {
  onCustomerSelect?: (customerId: string) => void;
}

const CustomersManagement: React.FC<CustomersManagementProps> = ({ onCustomerSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'table' | 'tiles'>('table');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const { customers, loading, error, refetch } = useCustomers();
  const { subscriptions } = useCustomerSubscriptions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading customers...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading customers: {error}</p>
      </div>
    );
  }

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getCustomerSubscriptions = (customerId: string) => {
    return subscriptions.filter(sub => sub.customer_id === customerId);
  };

  // Calculate customer metrics
  const totalCustomers = customers.length;
  const activeCustomers = customers.filter(c => c.status === 'active').length;
  const totalRevenue = customers.reduce((sum, customer) => sum + customer.total_spent, 0);
  const averageCustomerValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;
  
  // Get top customers by revenue
  const topCustomers = customers
    .map(customer => ({
      ...customer,
      subscriptions: getCustomerSubscriptions(customer.id),
      totalRevenue: customer.total_spent
    }))
    .sort((a, b) => b.totalRevenue - a.totalRevenue)
    .slice(0, 3);

  // Get recent customers (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentCustomers = customers.filter(customer => 
    new Date(customer.created_at) > thirtyDaysAgo
  ).length;

  // Get customers with most subscriptions
  const customersWithMostSubs = customers
    .map(customer => ({
      ...customer,
      subscriptionCount: getCustomerSubscriptions(customer.id).length
    }))
    .sort((a, b) => b.subscriptionCount - a.subscriptionCount)
    .slice(0, 3);

  const handleAddSuccess = () => {
    refetch();
  };

  const handleEditCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setShowEditForm(true);
  };

  const handleViewCustomer = (customerId: string) => {
    if (onCustomerSelect) {
      onCustomerSelect(customerId);
    }
  };

  const handleStatusToggle = async (customer: any) => {
    try {
      const newStatus = customer.status === 'active' ? 'inactive' : 'active';
      const { error } = await supabase
        .from('customers')
        .update({ status: newStatus })
        .eq('id', customer.id);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating customer status:', error);
    }
  };

  const renderTableView = () => (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-light-gray">
          <thead className="bg-light-gray">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Location
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Subscriptions
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Total Spent
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Join Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-soft-white divide-y divide-light-gray">
            {filteredCustomers.map((customer) => {
              const customerSubs = getCustomerSubscriptions(customer.id);
              return (
                <tr key={customer.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 mr-4">
                        <CompanyLogo 
                          src={customer.logo_url} 
                          companyName={customer.company} 
                          size="md"
                        />
                      </div>
                      <div>
                        <button 
                          onClick={() => handleViewCustomer(customer.id)}
                          className="text-sm font-medium text-charcoal hover:text-royal-blue hover:underline transition-colors cursor-pointer"
                        >
                          {customer.name}
                        </button>
                        <div className="text-sm text-charcoal-light flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {customer.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <Building className="h-4 w-4 mr-2 text-charcoal-light" />
                      <button 
                        onClick={() => handleViewCustomer(customer.id)}
                        className="hover:text-royal-blue hover:underline transition-colors cursor-pointer"
                      >
                        {customer.company}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-charcoal">
                      <div className="flex items-center mb-1">
                        <Mail className="h-3 w-3 mr-1 text-charcoal-light" />
                        {customer.email}
                      </div>
                      {customer.phone && (
                        <div className="flex items-center text-xs text-charcoal-light">
                          <span className="mr-1">📞</span>
                          {customer.phone}
                        </div>
                      )}
                      {customer.website && (
                        <div className="flex items-center text-xs text-charcoal-light">
                          <span className="mr-1">🌐</span>
                          <a href={customer.website} target="_blank" rel="noopener noreferrer" className="hover:text-royal-blue">
                            {customer.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-charcoal">
                      {customer.country && (
                        <div className="flex items-center mb-1">
                          <span className="mr-1">🌍</span>
                          {customer.country}
                        </div>
                      )}
                      {customer.state && (
                        <div className="flex items-center text-xs text-charcoal-light">
                          <span className="mr-1">📍</span>
                          {customer.state}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customer.status === 'active'}
                        onChange={() => handleStatusToggle(customer)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      <span className="ml-3 text-sm font-medium text-gray-900">
                        {customer.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </label>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal">
                    <div className="flex items-center">
                      <span className="font-medium">{customerSubs.length}</span>
                      <span className="ml-1 text-charcoal-light">active</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      ${customer.total_spent.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-light">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(customer.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => handleEditCustomer(customer)}
                      className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all"
                      title="Edit Customer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderTileView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredCustomers.map((customer) => {
        const customerSubs = getCustomerSubscriptions(customer.id);
        const activeSubscriptions = customerSubs.filter(sub => sub.status === 'active').length;
        const totalRevenue = customerSubs.reduce((sum, sub) => sum + sub.price, 0);
        
        return (
          <div key={customer.id} className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <CompanyLogo 
                src={customer.logo_url} 
                companyName={customer.company} 
                size="lg"
              />
              <StatusIcon 
                status={customer.status} 
                type="customer" 
                size="md"
              />
            </div>

            {/* Company Info */}
            <div className="mb-4">
              <h3 className="text-lg font-bold text-charcoal mb-1">{customer.company}</h3>
              <p className="text-sm text-charcoal-light font-medium">{customer.name}</p>
              <div className="flex items-center text-xs text-charcoal-light mt-1">
                <Mail className="h-3 w-3 mr-1" />
                <span className="truncate">{customer.email}</span>
              </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-light-gray rounded-xl p-3">
                <div className="flex items-center mb-1">
                  <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                  <span className="text-xs font-medium text-charcoal-light">Total Spent</span>
                </div>
                <p className="text-lg font-bold text-charcoal">${customer.total_spent.toLocaleString()}</p>
              </div>
              <div className="bg-light-gray rounded-xl p-3">
                <div className="flex items-center mb-1">
                  <Building className="h-4 w-4 text-royal-blue mr-1" />
                  <span className="text-xs font-medium text-charcoal-light">Subscriptions</span>
                </div>
                <p className="text-lg font-bold text-charcoal">{activeSubscriptions}</p>
              </div>
            </div>

            {/* Monthly Revenue */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-charcoal-light">Monthly Revenue</span>
                <span className="text-sm font-bold text-purple-600">${totalRevenue.toFixed(0)}/mo</span>
              </div>
              <div className="w-full bg-light-gray rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((totalRevenue / 1000) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Join Date */}
            <div className="mb-4 text-xs text-charcoal-light">
              <div className="flex items-center">
                <Calendar className="h-3 w-3 mr-1" />
                <span>Customer since {new Date(customer.created_at).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-4 border-t border-light-gray">
              <div className="flex space-x-2">
                <button 
                  onClick={() => handleEditCustomer(customer)}
                  className="p-2 text-charcoal-light hover:text-royal-blue hover:bg-sky-blue hover:bg-opacity-20 rounded-xl transition-all"
                  title="Edit Customer"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleViewCustomer(customer.id)}
                  className="p-2 text-charcoal-light hover:text-green-600 hover:bg-green-50 rounded-xl transition-all"
                  title="View Dashboard"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
              <div className="text-xs text-charcoal-light">
                {customerSubs.length} total subs
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Customer Management</h1>
          <p className="text-charcoal-light mt-2">Manage your customers and their subscription details</p>
        </div>
        <button 
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Customer
        </button>
      </div>

      {/* Customer Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Customers */}
        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl">
              <Users className="h-6 w-6 text-soft-white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-charcoal-light">Total</p>
              <p className="text-2xl font-bold text-charcoal">{totalCustomers}</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+{recentCustomers} this month</span>
          </div>
        </div>

        {/* Active Customers */}
        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <Activity className="h-6 w-6 text-soft-white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-charcoal-light">Active</p>
              <p className="text-2xl font-bold text-charcoal">{activeCustomers}</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <div className="w-full bg-light-gray rounded-full h-2 mr-2">
              <div 
                className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                style={{ width: `${totalCustomers > 0 ? (activeCustomers / totalCustomers) * 100 : 0}%` }}
              ></div>
            </div>
            <span className="text-charcoal-light text-xs">
              {totalCustomers > 0 ? Math.round((activeCustomers / totalCustomers) * 100) : 0}%
            </span>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
              <DollarSign className="h-6 w-6 text-soft-white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-charcoal-light">Revenue</p>
              <p className="text-2xl font-bold text-charcoal">${totalRevenue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
            <span className="text-green-600 font-medium">+12.5% vs last month</span>
          </div>
        </div>

        {/* Average Customer Value */}
        <div className="card p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
              <Award className="h-6 w-6 text-soft-white" />
            </div>
            <div className="text-right">
              <p className="text-xs text-charcoal-light">Avg Value</p>
              <p className="text-2xl font-bold text-charcoal">${averageCustomerValue.toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center text-sm">
            <Star className="h-4 w-4 text-yellow-500 mr-1" />
            <span className="text-charcoal-light">Per customer</span>
          </div>
        </div>
      </div>

      {/* Top Customers & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Customers by Revenue */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl mr-4">
              <Star className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Top Customers</h3>
          </div>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-light-gray rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-soft-white font-bold text-sm mr-3 ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-500' : 
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' : 
                    'bg-gradient-to-br from-orange-400 to-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm">{customer.company}</p>
                    <p className="text-xs text-charcoal-light">{customer.name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal text-sm">${customer.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs text-charcoal-light">{customer.subscriptions.length} subs</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Most Active Customers */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-royal-blue to-sky-blue rounded-xl mr-4">
              <Activity className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Most Active</h3>
          </div>
          <div className="space-y-4">
            {customersWithMostSubs.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between p-3 bg-light-gray rounded-xl hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-soft-white font-bold text-sm mr-3 ${
                    index === 0 ? 'bg-gradient-to-br from-royal-blue to-sky-blue' : 
                    index === 1 ? 'bg-gradient-to-br from-purple-500 to-purple-600' : 
                    'bg-gradient-to-br from-green-500 to-emerald-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-charcoal text-sm">{customer.company}</p>
                    <p className="text-xs text-charcoal-light">{customer.subscriptionCount} subscriptions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-charcoal text-sm">${customer.total_spent.toLocaleString()}</p>
                  <StatusIcon status={customer.status} type="customer" size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card p-6">
          <div className="flex items-center mb-6">
            <div className="p-3 bg-gradient-to-br from-bright-cyan to-sky-blue rounded-xl mr-4">
              <Clock className="h-6 w-6 text-soft-white" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Recent Activity</h3>
          </div>
          <div className="space-y-4">
            {customers.slice(0, 4).map((customer) => (
              <div key={customer.id} className="flex items-start space-x-3 p-3 hover:bg-light-gray rounded-xl transition-colors">
                <div className="w-2 h-2 rounded-full bg-green-400 mt-2"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-charcoal font-medium text-sm">{customer.company}</p>
                  <p className="text-charcoal-light text-xs">New customer registered</p>
                  <p className="text-xs text-charcoal-light mt-1">
                    {new Date(customer.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters and View Toggle */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-charcoal-light">View:</span>
            <div className="flex bg-light-gray rounded-lg p-1">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'table'
                    ? 'bg-royal-blue text-soft-white shadow-sm'
                    : 'text-charcoal-light hover:text-charcoal'
                }`}
              >
                <List className="h-4 w-4 mr-1" />
                Table
              </button>
              <button
                onClick={() => setViewMode('tiles')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all ${
                  viewMode === 'tiles'
                    ? 'bg-royal-blue text-soft-white shadow-sm'
                    : 'text-charcoal-light hover:text-charcoal'
                }`}
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                Tiles
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="flex items-center text-sm text-charcoal-light">
            <Filter className="h-4 w-4 mr-2" />
            {filteredCustomers.length} of {customers.length} customers
          </div>
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? renderTableView() : renderTileView()}

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <Plus className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
          <h3 className="text-lg font-medium text-charcoal mb-2">No customers found</h3>
          <p className="text-charcoal-light">Try adjusting your search or filter criteria</p>
        </div>
      )}

      <AddCustomerForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onSuccess={handleAddSuccess}
      />

      <EditCustomerForm
        isOpen={showEditForm}
        onClose={() => setShowEditForm(false)}
        onSuccess={handleAddSuccess}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default CustomersManagement;