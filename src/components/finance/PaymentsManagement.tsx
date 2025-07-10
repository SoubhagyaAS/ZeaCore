import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  Building, 
  Receipt, 
  Eye, 
  RefreshCcw, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { usePaymentTransactions } from '../../hooks/useFinance';
import CreatePaymentForm from './forms/CreatePaymentForm';
import CompanyLogo from '../common/CompanyLogo';

interface PaymentsManagementProps {
  onPaymentSelect: (paymentId: string) => void;
}

const PaymentsManagement: React.FC<PaymentsManagementProps> = ({ onPaymentSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { payments, loading, error, refetch } = usePaymentTransactions();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading payments...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading payments: {error}</p>
      </div>
    );
  }

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.transaction_reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'refunded':
        return <RefreshCcw className="h-5 w-5 text-orange-600" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-600" />;
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

  const getPaymentMethodIcon = (type: string | undefined) => {
    switch (type) {
      case 'card':
        return <CreditCard className="h-4 w-4 text-purple-600" />;
      case 'bank_transfer':
        return <Building className="h-4 w-4 text-blue-600" />;
      case 'paypal':
        return <DollarSign className="h-4 w-4 text-blue-600" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  // Calculate summary metrics
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const completedAmount = filteredPayments
    .filter(payment => payment.status === 'completed')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const pendingAmount = filteredPayments
    .filter(payment => payment.status === 'pending')
    .reduce((sum, payment) => sum + payment.amount, 0);
  const refundedAmount = filteredPayments
    .filter(payment => payment.status === 'refunded')
    .reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Payments</h1>
          <p className="text-charcoal-light mt-2">Track and manage all payment transactions</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Record Payment
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Total Payments</p>
              <p className="text-2xl font-bold text-charcoal">${totalAmount.toFixed(2)}</p>
            </div>
            <div className="bg-royal-blue bg-opacity-10 p-3 rounded-xl">
              <DollarSign className="h-6 w-6 text-royal-blue" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Completed</p>
              <p className="text-2xl font-bold text-green-600">${completedAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Pending</p>
              <p className="text-2xl font-bold text-blue-600">${pendingAmount.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Refunded</p>
              <p className="text-2xl font-bold text-orange-600">${refundedAmount.toFixed(2)}</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-xl">
              <RefreshCcw className="h-6 w-6 text-orange-600" />
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
              placeholder="Search payments..."
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
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          
          <div className="flex items-center text-sm text-charcoal-light">
            <Filter className="h-4 w-4 mr-2" />
            {filteredPayments.length} of {payments.length} payments
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-gray">
            <thead className="bg-light-gray">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Transaction
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
                  Method
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
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 text-royal-blue mr-3" />
                      <div className="text-sm font-medium text-charcoal">
                        {payment.transaction_reference || payment.id.substring(0, 8)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CompanyLogo 
                        companyName={payment.customer_company || ''} 
                        size="sm" 
                        className="mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-charcoal">{payment.customer_company}</div>
                        <div className="text-xs text-charcoal-light">{payment.customer_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      {payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                      {getStatusIcon(payment.status)}
                      <span className="ml-1 capitalize">{payment.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <Calendar className="h-4 w-4 mr-1 text-charcoal-light" />
                      {new Date(payment.transaction_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      {getPaymentMethodIcon(payment.payment_method_type)}
                      <span className="ml-1 capitalize">{payment.payment_method_type || payment.gateway}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      {payment.invoice_number ? (
                        <div className="flex items-center">
                          <Receipt className="h-4 w-4 mr-1 text-charcoal-light" />
                          <span>{payment.invoice_number}</span>
                        </div>
                      ) : (
                        <span className="text-charcoal-light">-</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onPaymentSelect(payment.id)}
                        className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all"
                        title="View Payment"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {payment.status === 'completed' && (
                        <button 
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 p-2 rounded-lg transition-all"
                          title="Create Refund"
                        >
                          <RefreshCcw className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredPayments.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="h-10 w-10 text-charcoal-light" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">No payments found</h3>
          <p className="text-charcoal-light">
            {payments.length === 0 
              ? 'Record your first payment to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}

      {/* Create Payment Modal */}
      {showCreateForm && (
        <CreatePaymentForm
          isOpen={showCreateForm}
          onClose={() => setShowCreateForm(false)}
          onSuccess={() => {
            setShowCreateForm(false);
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default PaymentsManagement;