import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Building, 
  Calendar, 
  DollarSign, 
  Receipt, 
  Download, 
  Loader2,
  CheckCircle,
  XCircle,
  RefreshCcw,
  Mail,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { usePaymentDetails } from '../../hooks/useFinance';
import CreateRefundForm from './forms/CreateRefundForm';
import CompanyLogo from '../common/CompanyLogo';

interface PaymentDetailsProps {
  paymentId: string | null;
  onBack: () => void;
}

const PaymentDetails: React.FC<PaymentDetailsProps> = ({ paymentId, onBack }) => {
  const [showRefundForm, setShowRefundForm] = useState(false);
  const { payment, refunds, invoice, loading, error, refetch } = usePaymentDetails(paymentId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-royal-blue" />
        <span className="ml-2 text-charcoal">Loading payment details...</span>
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="text-center py-16">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-charcoal mb-2">Payment Not Found</h3>
        <p className="text-charcoal-light">{error || 'The requested payment could not be found'}</p>
        <button onClick={onBack} className="btn-primary mt-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Payments
        </button>
      </div>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'pending':
        return <Calendar className="h-5 w-5 text-blue-600" />;
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

  const getRefundStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Calendar className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCcw className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRefundStatusColor = (status: string) => {
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

  const formatCardDetails = (details: any) => {
    if (!details) return 'N/A';
    
    if (details.last4) {
      return `${details.brand || 'Card'} •••• ${details.last4}`;
    }
    
    if (details.email) {
      return `PayPal (${details.email})`;
    }
    
    if (details.bank_name) {
      return `${details.bank_name} •••• ${details.account_last4 || ''}`;
    }
    
    return 'Payment method';
  };

  const totalRefunded = refunds.reduce((sum, refund) => sum + refund.amount, 0);
  const canRefund = payment.status === 'completed' && totalRefunded < payment.amount;

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
            <h1 className="text-4xl font-bold text-charcoal mb-2">
              Payment {payment.transaction_reference || payment.id.substring(0, 8)}
            </h1>
            <div className="flex items-center space-x-4">
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payment.status)}`}>
                {getStatusIcon(payment.status)}
                <span className="ml-1 capitalize">{payment.status}</span>
              </div>
              <div className="text-charcoal-light">
                {new Date(payment.transaction_date).toLocaleDateString()} at {new Date(payment.transaction_date).toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="btn-secondary flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </button>
          {canRefund && (
            <button 
              onClick={() => setShowRefundForm(true)}
              className="btn-primary flex items-center"
            >
              <RefreshCcw className="h-4 w-4 mr-2" />
              Process Refund
            </button>
          )}
        </div>
      </div>

      {/* Payment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Customer & Payment Info */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Customer</h3>
            <div className="flex items-center mb-4">
              <CompanyLogo 
                companyName={payment.customer_company || ''} 
                size="lg" 
                className="mr-4"
              />
              <div>
                <h4 className="text-lg font-semibold text-charcoal">{payment.customer_company}</h4>
                <p className="text-charcoal-light">{payment.customer_name}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 text-charcoal-light" />
                <span className="text-charcoal">{payment.customer_email}</span>
              </div>
              <button className="text-royal-blue hover:text-sky-blue text-sm font-medium flex items-center mt-2">
                <Building className="h-4 w-4 mr-2" />
                View Customer Profile
              </button>
            </div>
          </div>

          {/* Payment Details */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Payment Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Transaction ID</div>
                <div className="font-medium text-charcoal">{payment.transaction_reference || payment.id.substring(0, 8)}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Date</div>
                <div className="font-medium text-charcoal">{new Date(payment.transaction_date).toLocaleDateString()}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Time</div>
                <div className="font-medium text-charcoal">{new Date(payment.transaction_date).toLocaleTimeString()}</div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Payment Method</div>
                <div className="font-medium text-charcoal capitalize">
                  {payment.payment_method_type || payment.gateway}
                </div>
              </div>
              {payment.payment_method_details && (
                <div className="flex justify-between items-center">
                  <div className="text-charcoal-light">Payment Details</div>
                  <div className="font-medium text-charcoal">
                    {formatCardDetails(payment.payment_method_details)}
                  </div>
                </div>
              )}
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Gateway</div>
                <div className="font-medium text-charcoal capitalize">{payment.gateway}</div>
              </div>
            </div>
          </div>

          {/* Payment Status */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Payment Status</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Status</div>
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                  {getStatusIcon(payment.status)}
                  <span className="ml-1 capitalize">{payment.status}</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-charcoal-light">Amount</div>
                <div className="font-bold text-charcoal text-xl">${payment.amount.toFixed(2)}</div>
              </div>
              {totalRefunded > 0 && (
                <div className="flex justify-between items-center">
                  <div className="text-charcoal-light">Refunded</div>
                  <div className="font-medium text-orange-600">${totalRefunded.toFixed(2)}</div>
                </div>
              )}
              {payment.status === 'completed' && totalRefunded > 0 && totalRefunded < payment.amount && (
                <div className="flex justify-between items-center">
                  <div className="text-charcoal-light">Net Amount</div>
                  <div className="font-medium text-charcoal">${(payment.amount - totalRefunded).toFixed(2)}</div>
                </div>
              )}
              {payment.status === 'failed' && payment.gateway_response?.error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
                  <div className="flex items-start">
                    <AlertTriangle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Payment Failed</p>
                      <p className="text-sm text-red-700 mt-1">{payment.gateway_response.error}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Invoice & Refunds */}
        <div className="lg:col-span-2 space-y-6">
          {/* Related Invoice */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Related Invoice</h3>
            {invoice ? (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 text-royal-blue mr-3" />
                    <div>
                      <div className="text-lg font-semibold text-charcoal">{invoice.invoice_number}</div>
                      <div className="text-sm text-charcoal-light">
                        Issued on {new Date(invoice.issue_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                    invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                    invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                    invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {invoice.status === 'paid' ? <CheckCircle className="h-4 w-4 mr-1" /> :
                     invoice.status === 'sent' ? <Mail className="h-4 w-4 mr-1" /> :
                     invoice.status === 'overdue' ? <AlertTriangle className="h-4 w-4 mr-1" /> :
                     <FileText className="h-4 w-4 mr-1" />}
                    <span className="capitalize">{invoice.status}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="text-charcoal-light">Invoice Amount</div>
                    <div className="font-medium text-charcoal">${invoice.total_amount.toFixed(2)}</div>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-charcoal-light">Due Date</div>
                    <div className="font-medium text-charcoal">{new Date(invoice.due_date).toLocaleDateString()}</div>
                  </div>
                  {invoice.invoice_type === 'subscription' && (
                    <div className="flex justify-between items-center">
                      <div className="text-charcoal-light">Type</div>
                      <div className="font-medium text-charcoal capitalize">{invoice.invoice_type}</div>
                    </div>
                  )}
                </div>

                <button className="text-royal-blue hover:text-sky-blue text-sm font-medium flex items-center mt-4">
                  <Receipt className="h-4 w-4 mr-2" />
                  View Invoice Details
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
                <h4 className="text-lg font-medium text-charcoal mb-2">No Invoice Associated</h4>
                <p className="text-charcoal-light">
                  This payment is not linked to any specific invoice
                </p>
              </div>
            )}
          </div>

          {/* Refunds */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-charcoal mb-4">Refunds</h3>
            {refunds.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-light-gray">
                  <thead className="bg-light-gray">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Refund ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Reason
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-charcoal-light uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-soft-white divide-y divide-light-gray">
                    {refunds.map((refund) => (
                      <tr key={refund.id} className="hover:bg-sky-blue hover:bg-opacity-5">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <RefreshCcw className="h-4 w-4 text-royal-blue mr-2" />
                            <div className="text-sm font-medium text-charcoal">
                              {refund.id.substring(0, 8)}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-charcoal">
                          {new Date(refund.refund_date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRefundStatusColor(refund.status)}`}>
                            {getRefundStatusIcon(refund.status)}
                            <span className="ml-1 capitalize">{refund.status}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-charcoal">
                          <div className="line-clamp-1">{refund.reason}</div>
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-medium text-orange-600">
                          ${refund.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-light-gray">
                    <tr>
                      <td colSpan={4} className="px-4 py-3 text-right text-sm font-medium text-charcoal">
                        Total Refunded
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-orange-600">
                        ${totalRefunded.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <RefreshCcw className="h-12 w-12 text-charcoal-light mx-auto mb-4" />
                <h4 className="text-lg font-medium text-charcoal mb-2">No Refunds</h4>
                <p className="text-charcoal-light">
                  This payment has not been refunded
                </p>
                {canRefund && (
                  <button 
                    onClick={() => setShowRefundForm(true)}
                    className="btn-primary mt-4"
                  >
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Process Refund
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Gateway Response */}
          {payment.gateway_response && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-charcoal mb-4">Gateway Response</h3>
              <div className="bg-light-gray rounded-xl p-4 overflow-x-auto">
                <pre className="text-sm text-charcoal">
                  {JSON.stringify(payment.gateway_response, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Notes */}
          {payment.notes && (
            <div className="card p-6">
              <h3 className="text-xl font-bold text-charcoal mb-4">Notes</h3>
              <p className="text-charcoal-light">{payment.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Refund Modal */}
      {showRefundForm && (
        <CreateRefundForm
          isOpen={showRefundForm}
          onClose={() => setShowRefundForm(false)}
          onSuccess={() => {
            setShowRefundForm(false);
            refetch();
          }}
          payment={payment}
          invoice={invoice}
          existingRefunds={refunds}
        />
      )}
    </div>
  );
};

export default PaymentDetails;