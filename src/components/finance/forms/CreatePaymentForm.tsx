import React, { useState, useEffect } from 'react';
import { X, CreditCard, Building, DollarSign, Receipt, Loader2 } from 'lucide-react';
import { useCustomers } from '../../../hooks/useSupabaseData';
import { usePaymentMethods, useCreatePayment, useInvoices } from '../../../hooks/useFinance';

interface CreatePaymentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedInvoiceId?: string;
  preselectedCustomerId?: string;
  preselectedAmount?: number;
}

const CreatePaymentForm: React.FC<CreatePaymentFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  preselectedInvoiceId,
  preselectedCustomerId,
  preselectedAmount
}) => {
  const { customers } = useCustomers();
  const { invoices } = useInvoices();
  const { createPayment, loading, error, success } = useCreatePayment();

  const [formData, setFormData] = useState({
    customer_id: preselectedCustomerId || '',
    invoice_id: preselectedInvoiceId || '',
    payment_method_id: '',
    amount: preselectedAmount ? preselectedAmount.toString() : '',
    transaction_reference: '',
    gateway: 'manual',
    notes: ''
  });

  const { paymentMethods } = usePaymentMethods(formData.customer_id);

  // Filter invoices based on selected customer
  const customerInvoices = invoices.filter(
    invoice => invoice.customer_id === formData.customer_id && 
    (invoice.status === 'sent' || invoice.status === 'overdue')
  );

  // Update amount when invoice is selected
  useEffect(() => {
    if (formData.invoice_id) {
      const selectedInvoice = invoices.find(inv => inv.id === formData.invoice_id);
      if (selectedInvoice) {
        setFormData(prev => ({
          ...prev,
          amount: selectedInvoice.total_amount.toString()
        }));
      }
    }
  }, [formData.invoice_id, invoices]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    
    // Create payment
    const paymentId = await createPayment({
      invoice_id: formData.invoice_id || undefined,
      customer_id: formData.customer_id,
      payment_method_id: formData.payment_method_id || undefined,
      amount: parseFloat(formData.amount),
      transaction_reference: formData.transaction_reference || undefined,
      gateway: formData.gateway,
      notes: formData.notes || undefined
    });
    
    if (paymentId) {
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Record Payment</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer Selection */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              <Building className="h-4 w-4 inline mr-1" />
              Customer
            </label>
            <select
              name="customer_id"
              value={formData.customer_id}
              onChange={handleChange}
              required
              disabled={!!preselectedCustomerId}
              className="input-field"
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.company} ({customer.name})
                </option>
              ))}
            </select>
            {preselectedCustomerId && (
              <p className="text-xs text-charcoal-light mt-1">Customer is pre-selected from invoice</p>
            )}
          </div>

          {/* Invoice Selection */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              <Receipt className="h-4 w-4 inline mr-1" />
              Invoice (Optional)
            </label>
            <select
              name="invoice_id"
              value={formData.invoice_id}
              onChange={handleChange}
              disabled={!formData.customer_id || !!preselectedInvoiceId}
              className="input-field"
            >
              <option value="">No Invoice (Manual Payment)</option>
              {customerInvoices.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.invoice_number} - ${invoice.total_amount.toFixed(2)}
                </option>
              ))}
            </select>
            {!formData.customer_id && !preselectedInvoiceId && (
              <p className="text-xs text-charcoal-light mt-1">Select a customer first</p>
            )}
            {preselectedInvoiceId && (
              <p className="text-xs text-charcoal-light mt-1">Invoice is pre-selected</p>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Payment Method
            </label>
            <select
              name="payment_method_id"
              value={formData.payment_method_id}
              onChange={handleChange}
              disabled={!formData.customer_id}
              className="input-field"
            >
              <option value="">Manual Payment</option>
              {paymentMethods.map(method => (
                <option key={method.id} value={method.id}>
                  {method.method_type === 'card' && method.details?.last4 
                    ? `Card •••• ${method.details.last4}` 
                    : method.method_type === 'paypal' && method.details?.email
                    ? `PayPal (${method.details.email})`
                    : method.method_type === 'bank_transfer' && method.details?.bank_name
                    ? `${method.details.bank_name} Bank Transfer`
                    : method.method_type.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <DollarSign className="h-4 w-4 inline mr-1" />
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light h-4 w-4" />
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0.01"
                  step="0.01"
                  disabled={!!preselectedAmount}
                  className="input-field pl-8"
                  placeholder="0.00"
                />
              </div>
              {preselectedAmount && (
                <p className="text-xs text-charcoal-light mt-1">Amount is pre-filled from invoice</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Transaction Reference (Optional)
              </label>
              <input
                type="text"
                name="transaction_reference"
                value={formData.transaction_reference}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Transaction ID, Check #"
              />
            </div>
          </div>

          {/* Payment Gateway */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Payment Gateway
            </label>
            <select
              name="gateway"
              value={formData.gateway}
              onChange={handleChange}
              required
              className="input-field"
            >
              <option value="manual">Manual Payment</option>
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="check">Check</option>
              <option value="cash">Cash</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Notes (Optional)
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="input-field"
              placeholder="Add any notes about this payment"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 text-sm">Payment recorded successfully!</p>
            </div>
          )}

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-light-gray rounded-xl text-charcoal hover:bg-light-gray transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <CreditCard className="h-5 w-5 mr-2" />
                  Record Payment
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePaymentForm;