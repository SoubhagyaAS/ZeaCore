import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Receipt, 
  Building, 
  Calendar, 
  DollarSign, 
  Package, 
  Download, 
  Send, 
  Printer, 
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  RefreshCcw,
  Mail
} from 'lucide-react';
import { useInvoiceDetails, useUpdateInvoiceStatus } from '../../hooks/useFinance';
import CreatePaymentForm from './forms/CreatePaymentForm';
import CompanyLogo from '../common/CompanyLogo';

interface InvoiceDetailsProps {
  invoiceId: string | null;
  onBack: () => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({ invoiceId, onBack }) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const { invoice, invoiceItems, payments, loading, error, refetch } = useInvoiceDetails(invoiceId);
  const { updateInvoiceStatus, loading: updateLoading, success: updateSuccess } = useUpdateInvoiceStatus();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading invoice details...</span>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">Invoice Not Found</h3>
        <p className="text-charcoal-light">{error || 'The requested invoice could not be found'}</p>
        <button onClick={onBack} className="btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Invoices
        </button>
      </div>
    );
  }

  const handleStatusChange = async (newStatus: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled') => {
    const success = await updateInvoiceStatus(invoice.id, newStatus);
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

  const getPaymentStatusIcon = (status: string) => {
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

  const getPaymentStatusColor = (status: string) => {
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

  const isPaid = invoice.status === 'paid';
  const isCancelled = invoice.status === 'cancelled';
  const isDraft = invoice.status === 'draft';
  const isSent = invoice.status === 'sent';
  const isOverdue = invoice.status === 'overdue';

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
          <div>
            <h1 className="text-4xl font-bold text-charcoal mb-2">Invoice {invoice.invoice_number}</h1>
            <div className="flex items-center space-x-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                {getStatusIcon(invoice.status)}
                <span className="ml-1 capitalize">{invoice.status}</span>
              </div>
              <div className="text-charcoal-light">
                Issued on {new Date(invoice.issue_date).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download
          </button>
          <button className="btn-secondary flex items-center">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          {isDraft && (
            <button 
              onClick={() => handleStatusChange('sent')}
              disabled={updateLoading}
              className="btn-primary flex items-center"
            >
              {updateLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              Send Invoice
            </button>
          )}
          {isSent && !isPaid && (
            <button 
              onClick={() => setShowPaymentForm(true)}
              className="btn-primary flex items-center"
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Record Payment
            </button>
          )}
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Customer & Invoice Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Customer</h3>
            <div className="flex items-center mb-4">
              <CompanyLogo 
                companyName={invoice.customer_company || ''} 
                size="lg" 
                className="mr-4"
              />
              <div>
                <h4 className="text-lg font-semibold text-charcoal">{invoice.customer_company}</h4>
                <p className="text-charcoal-light">{invoice.customer_name}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-charcoal-light" />
                <span className="text-charcoal">{invoice.customer_email}</span>
              </div>
              <button className="text-royal-blue hover:text-sky-blue text-sm font-medium flex items-center mt-2">
                <Building className="h-4 w-4 mr-2" />
                View Customer Profile
              </button>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Invoice Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Invoice Number</div>
                <div className="font-medium text-charcoal">{invoice.invoice_number}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Issue Date</div>
                <div className="font-medium text-charcoal">{new Date(invoice.issue_date).toLocaleDateString()}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Due Date</div>
                <div className="font-medium text-charcoal">{new Date(invoice.due_date).toLocaleDateString()}</div>
              </div>
              {invoice.paid_date && (
                <div className="flex justify-between items-center">
                  <div className="text-charcoal-light">Paid Date</div>
                  <div className="font-medium text-green-600">{new Date(invoice.paid_date).toLocaleDateString()}</div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Invoice Type</div>
                <div className="font-medium text-charcoal capitalize">{invoice.invoice_type}</div>
              </div>
              {invoice.invoice_type === 'subscription' && invoice.billing_period_start && invoice.billing_period_end && (
                <div className="flex justify-between items-center">
                  <div className="text-charcoal-light">Billing Period</div>
                  <div className="font-medium text-charcoal">
                    {new Date(invoice.billing_period_start).toLocaleDateString()} - {new Date(invoice.billing_period_end).toLocaleDateString()}
                  </div>
                </div>
              )}
              {invoice.subscription_plan_name && (
                <div className="flex justify-between items-center">
                  <div className="text-charcoal-light">Subscription Plan</div>
                  <div className="font-medium text-charcoal">{invoice.subscription_plan_name}</div>
                </div>
              )}
              {invoice.app_name && (
                <div className="flex justify-between items-center">
                  <div className="text-charcoal-light">App</div>
                  <div className="font-medium text-charcoal">{invoice.app_name}</div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Status */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Payment Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                  {getStatusIcon(invoice.status)}
                  <span className="ml-1 capitalize">{invoice.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Total Amount</div>
                <div className="font-bold text-charcoal text-xl">${invoice.total_amount.toFixed(2)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Amount Paid</div>
                <div className="font-medium text-green-600">
                  ${payments
                    .filter(p => p.status === 'completed')
                    .reduce((sum, p) => sum + p.amount, 0)
                    .toFixed(2)}
                </div>
              </div>
              {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                <div className="flex justify-between items-center">
                  <div className="text-charcoal-light">Balance Due</div>
                  <div className="font-medium text-red-600">
                    ${(invoice.total_amount - 
                      payments
                        .filter(p => p.status === 'completed')
                        .reduce((sum, p) => sum + p.amount, 0)
                      ).toFixed(2)}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              {isSent && !isPaid && (
                <button 
                  onClick={() => handleStatusChange('paid')}
                  disabled={updateLoading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {updateLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Mark as Paid
                </button>
              )}
              {(isSent || isOverdue) && !isPaid && !isCancelled && (
                <button 
                  onClick={() => handleStatusChange('cancelled')}
                  disabled={updateLoading}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  {updateLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Cancel Invoice
                </button>
              )}
              {isDraft && (
                <button 
                  onClick={() => handleStatusChange('sent')}
                  disabled={updateLoading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {updateLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Invoice
                </button>
              )}
              {isSent && !isPaid && !isOverdue && (
                <button 
                  onClick={() => handleStatusChange('overdue')}
                  disabled={updateLoading}
                  className="w-full btn-secondary flex items-center justify-center"
                >
                  {updateLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  Mark as Overdue
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Invoice Items & Payments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Items */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Invoice Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-light-gray">
                <thead className="bg-light-gray">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-light uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-soft-white divide-y divide-light-gray">
                  {invoiceItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-charcoal">{item.description}</div>
                        {item.app_name && (
                          <div className="text-xs text-charcoal-light">{item.app_name}</div>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-charcoal">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-4 text-right text-sm text-charcoal">
                        ${item.unit_price.toFixed(2)}
                      </td>
                      <td className="px-4 py-4 text-right text-sm font-medium text-charcoal">
                        ${item.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-light-gray">
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-charcoal">
                      Subtotal
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-charcoal">
                      ${invoice.amount.toFixed(2)}
                    </td>
                  </tr>
                  {invoice.tax_amount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-charcoal">
                        Tax
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-charcoal">
                        ${invoice.tax_amount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {invoice.discount_amount > 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right text-sm font-medium text-charcoal">
                        Discount
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-green-600">
                        -${invoice.discount_amount.toFixed(2)}
                      </td>
                    </tr>
                  )}
                  <tr>
                    <td colSpan={3} className="px-4 py-3 text-right text-base font-bold text-charcoal">
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-base font-bold text-charcoal">
                      ${invoice.total_amount.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Payments</h3>
            {payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-light-gray">
                  <thead className="bg-light-gray">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Transaction
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Method
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
                    {payments.map((payment) => (
                      <tr key={payment.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-royal-blue mr-2" />
                            <div className="text-sm font-medium text-charcoal">
                              {payment.transaction_reference || payment.id.substring(0, 8)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-charcoal">
                          {new Date(payment.transaction_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-charcoal capitalize">
                          {payment.payment_method_type || payment.gateway}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(payment.status)}`}>
                            {getPaymentStatusIcon(payment.status)}
                            <span className="ml-1 capitalize">{payment.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium text-charcoal">
                          ${payment.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
                <h4 className="text-lg font-medium text-charcoal mb-2">No Payments Yet</h4>
                <p className="text-charcoal-light">
                  {invoice.status === 'draft' 
                    ? 'Send the invoice to the customer first'
                    : invoice.status === 'sent' 
                      ? 'Waiting for customer payment'
                      : 'No payments recorded for this invoice'
                  }
                </p>
                {invoice.status === 'sent' && (
                  <button 
                    onClick={() => setShowPaymentForm(true)}
                    className="btn-primary mt-4"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Record Payment
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-charcoal mb-4">Notes</h3>
              <p className="text-charcoal-light">{invoice.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Payment Modal */}
      {showPaymentForm && (
        <CreatePaymentForm
          isOpen={showPaymentForm}
          onClose={() => setShowPaymentForm(false)}
          onSuccess={() => {
            setShowPaymentForm(false);
            refetch();
          }}
          preselectedInvoiceId={invoice.id}
          preselectedCustomerId={invoice.customer_id}
          preselectedAmount={invoice.total_amount}
        />
      )}
    </div>
  );
};

export default InvoiceDetails;