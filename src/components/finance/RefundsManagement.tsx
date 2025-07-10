import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  RefreshCcw, 
  DollarSign, 
  Calendar, 
  Building, 
  Receipt, 
  Eye, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { useRefunds } from '../../hooks/useFinance';
import CompanyLogo from '../common/CompanyLogo';

const RefundsManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { refunds, loading, error } = useRefunds();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading refunds...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading refunds: {error}</p>
      </div>
    );
  }

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = 
      refund.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customer_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || refund.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <RefreshCcw className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate summary metrics
  const totalRefunded = filteredRefunds
    .filter(refund => refund.status === 'completed')
    .reduce((sum, refund) => sum + refund.amount, 0);
  const pendingRefunds = filteredRefunds
    .filter(refund => refund.status === 'pending')
    .reduce((sum, refund) => sum + refund.amount, 0);
  const refundCount = filteredRefunds.length;
  const completedCount = filteredRefunds.filter(refund => refund.status === 'completed').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-charcoal">Refunds</h1>
        <p className="text-charcoal-light mt-2">Track and manage all refund transactions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Total Refunded</p>
              <p className="text-2xl font-bold text-charcoal">${totalRefunded.toFixed(2)}</p>
            </div>
            <div className="bg-royal-blue bg-opacity-10 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-royal-blue" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Pending Refunds</p>
              <p className="text-2xl font-bold text-blue-600">${pendingRefunds.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Refund Count</p>
              <p className="text-2xl font-bold text-charcoal">{refundCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-xl">
              <RefreshCcw className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
            <input
              type="text"
              placeholder="Search refunds..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-12"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
          
          <div className="flex items-center text-sm text-charcoal-light">
            <Filter className="h-4 w-4 mr-2" />
            {filteredRefunds.length} of {refunds.length} refunds
          </div>
        </div>
      </div>

      {/* Refunds Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-gray">
            <thead className="bg-light-gray">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Refund ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Invoice
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-soft-white divide-y divide-light-gray">
              {filteredRefunds.map((refund) => (
                <tr key={refund.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <RefreshCcw className="h-5 w-5 text-royal-blue mr-3" />
                      <div className="text-sm font-medium text-charcoal">{refund.id.substring(0, 8)}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CompanyLogo 
                        companyName={refund.customer_company || ''} 
                        size="sm" 
                        className="mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-charcoal">{refund.customer_company}</div>
                        <div className="text-xs text-charcoal-light">{refund.customer_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <DollarSign className="h-4 w-4 mr-1 text-orange-600" />
                      {refund.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                      {getStatusIcon(refund.status)}
                      <span className="ml-1 capitalize">{refund.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <Calendar className="h-4 w-4 mr-1 text-charcoal-light" />
                      {new Date(refund.refund_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-charcoal line-clamp-1">{refund.reason}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      {refund.invoice_number ? (
                        <div className="flex items-center">
                          <Receipt className="h-4 w-4 mr-1 text-charcoal-light" />
                          <span>{refund.invoice_number}</span>
                        </div>
                      ) : (
                        <span className="text-charcoal-light">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all"
                        title="View Refund"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredRefunds.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            <RefreshCcw className="h-10 w-10 text-charcoal-light" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">No refunds found</h3>
          <p className="text-charcoal-light">
            {refunds.length === 0 
              ? 'No refunds have been processed yet'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default RefundsManagement;