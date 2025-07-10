import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Receipt, 
  DollarSign, 
  Calendar, 
  Building, 
  Package, 
  Eye, 
  Download, 
  Send, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useInvoices, useUpdateInvoiceStatus } from '../../hooks/useFinance';
import CreateInvoiceForm from './forms/CreateInvoiceForm';
import StatusIcon from '../common/StatusIcon';
import CompanyLogo from '../common/CompanyLogo';

interface InvoicesManagementProps {
  onInvoiceSelect: (invoiceId: string) => void;
}

const InvoicesManagement: React.FC<InvoicesManagementProps> = ({ onInvoiceSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { invoices, loading, error, refetch } = useInvoices();
  const { updateInvoiceStatus, loading: updateLoading } = useUpdateInvoiceStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading invoices...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-red-800">Error loading invoices: {error}</p>
      </div>
    );
  }

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.app_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    const matchesType = typeFilter === 'all' || invoice.invoice_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = async (invoiceId: string, newStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') => {
    const success = await updateInvoiceStatus(invoiceId, newStatus);
    if (success) {
      refetch();
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'draft':
        return <Receipt className="h-5 w-5 text-gray-600" />;
      case 'sent':
        return <Send className="h-5 w-5 text-blue-600" />;
      case 'overdue':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Receipt className="h-5 w-5 text-gray-600" />;
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

  // Calculate summary metrics
  const totalAmount = filteredInvoices.reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const paidAmount = filteredInvoices
    .filter(invoice => invoice.status === 'paid')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const outstandingAmount = filteredInvoices
    .filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);
  const overdueAmount = filteredInvoices
    .filter(invoice => invoice.status === 'overdue')
    .reduce((sum, invoice) => sum + invoice.total_amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-charcoal">Invoices</h1>
          <p className="text-charcoal-light mt-2">Manage and track all customer invoices</p>
        </div>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Invoice
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Total Amount</p>
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
              <p className="text-sm font-medium text-charcoal-light">Paid</p>
              <p className="text-2xl font-bold text-green-600">${paidAmount.toFixed(2)}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-xl">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Outstanding</p>
              <p className="text-2xl font-bold text-blue-600">${outstandingAmount.toFixed(2)}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-charcoal-light">Overdue</p>
              <p className="text-2xl font-bold text-red-600">${overdueAmount.toFixed(2)}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-charcoal-light h-5 w-5" />
            <input
              type="text"
              placeholder="Search invoices..."
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
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </select>
          
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="input-field"
          >
            <option value="all">All Types</option>
            <option value="subscription">Subscription</option>
            <option value="one-time">One-time</option>
          </select>
          
          <div className="flex items-center text-sm text-charcoal-light">
            <Filter className="h-4 w-4 mr-2" />
            {filteredInvoices.length} of {invoices.length} invoices
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-light-gray">
            <thead className="bg-light-gray">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Invoice
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
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-soft-white divide-y divide-light-gray">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Receipt className="h-5 w-5 text-royal-blue mr-3" />
                      <div className="text-sm font-medium text-charcoal">{invoice.invoice_number}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CompanyLogo 
                        companyName={invoice.customer_company || ''} 
                        size="sm" 
                        className="mr-3"
                      />
                      <div>
                        <div className="text-sm font-medium text-charcoal">{invoice.customer_company}</div>
                        <div className="text-xs text-charcoal-light">{invoice.customer_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <DollarSign className="h-4 w-4 mr-1 text-green-600" />
                      {invoice.total_amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {getStatusIcon(invoice.status)}
                      <span className="ml-1 capitalize">{invoice.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <Calendar className="h-4 w-4 mr-1 text-charcoal-light" />
                      {new Date(invoice.issue_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-charcoal">
                      <Calendar className="h-4 w-4 mr-1 text-charcoal-light" />
                      {new Date(invoice.due_date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      {invoice.invoice_type === 'subscription' ? (
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-1 text-purple-600" />
                          <span className="text-charcoal">Subscription</span>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Receipt className="h-4 w-4 mr-1 text-orange-600" />
                          <span className="text-charcoal">One-time</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => onInvoiceSelect(invoice.id)}
                        className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all"
                        title="View Invoice"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        className="text-royal-blue hover:text-sky-blue hover:bg-sky-blue hover:bg-opacity-10 p-2 rounded-lg transition-all"
                        title="Download Invoice"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                      {invoice.status === 'draft' && (
                        <button 
                          onClick={() => handleStatusChange(invoice.id, 'sent')}
                          disabled={updateLoading}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-2 rounded-lg transition-all"
                          title="Mark as Sent"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      )}
                      {invoice.status === 'sent' && (
                        <button 
                          onClick={() => handleStatusChange(invoice.id, 'paid')}
                          disabled={updateLoading}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 p-2 rounded-lg transition-all"
                          title="Mark as Paid"
                        >
                          <CheckCircle className="h-4 w-4" />
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

      {filteredInvoices.length === 0 && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-light-gray rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Receipt className="h-10 w-10 text-charcoal-light" />
          </div>
          <h3 className="text-xl font-semibold text-charcoal mb-2">No invoices found</h3>
          <p className="text-charcoal-light">
            {invoices.length === 0 
              ? 'Create your first invoice to get started'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showCreateForm && (
        <CreateInvoiceForm
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

export default InvoicesManagement;