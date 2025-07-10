import React, { useState } from 'react';
import { X, RefreshCcw, DollarSign, Receipt, Loader2 } from 'lucide-react';
import { useCreateRefund, Invoice, PaymentTransaction, Refund } from '../../../hooks/useFinance';

interface CreateRefundFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  payment: PaymentTransaction;
  invoice: Invoice | null;
  existingRefunds: Refund[];
}

const CreateRefundForm: React.FC<CreateRefundFormProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess,
  payment,
  invoice,
  existingRefunds
}) => {
  const { createRefund, loading, error, success } = useCreateRefund();

  const [formData, setFormData] = useState({
    amount: '',
    reason: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }
    
    if (parseFloat(formData.amount) > availableForRefund) {
      alert(`Refund amount cannot exceed available amount of $${availableForRefund.toFixed(2)}`);
      return;
    }
    
    if (!formData.reason.trim()) {
      alert('Please provide a reason for the refund');
      return;
    }
    
    // Create refund
    const refundId = await createRefund({
      payment_transaction_id: payment.id,
      invoice_id: invoice?.id,
      amount: parseFloat(formData.amount),
      reason: formData.reason,
      notes: formData.notes || undefined
    });
    
    if (refundId) {
      onSuccess();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate available amount for refund
  const totalRefunded = existingRefunds.reduce((sum, refund) => sum + refund.amount, 0);
  const availableForRefund = payment.amount - totalRefunded;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-lg w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Process Refund</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Payment Information */}
          <div className="bg-light-gray rounded-xl p-4">
            <h3 className="font-semibold text-charcoal mb-3">Payment Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-charcoal-light">Transaction ID:</span>
                <span className="text-charcoal font-medium">
                  {payment.transaction_reference || payment.id.substring(0, 8)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-light">Customer:</span>
                <span className="text-charcoal font-medium">{payment.customer_company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal-light">Original Amount:</span>
                <span className="text-charcoal font-medium">${payment.amount.toFixed(2)}</span>
              </div>
              {totalRefunded > 0 && (
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Already Refunded:</span>
                  <span className="text-orange-600 font-medium">${totalRefunded.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-charcoal-light">Available for Refund:</span>
                <span className="text-green-600 font-medium">${availableForRefund.toFixed(2)}</span>
              </div>
              {invoice && (
                <div className="flex justify-between">
                  <span className="text-charcoal-light">Invoice:</span>
                  <span className="text-charcoal font-medium flex items-center">
                    <Receipt className="h-4 w-4 mr-1 text-charcoal-light" />
                    {invoice.invoice_number}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Refund Amount */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              <DollarSign className="h-4 w-4 inline mr-1" />
              Refund Amount
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
                max={availableForRefund}
                step="0.01"
                className="input-field pl-8"
                placeholder="0.00"
              />
            </div>
            <div className="flex justify-between mt-2">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, amount: (availableForRefund / 2).toFixed(2) }))}
                className="text-xs text-royal-blue hover:text-sky-blue"
              >
                Half
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, amount: availableForRefund.toFixed(2) }))}
                className="text-xs text-royal-blue hover:text-sky-blue"
              >
                Full Amount
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Reason for Refund
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              required
              className="input-field"
            >
              <option value="">Select Reason</option>
              <option value="Customer request">Customer request</option>
              <option value="Service issue">Service issue</option>
              <option value="Duplicate payment">Duplicate payment</option>
              <option value="Subscription cancelled">Subscription cancelled</option>
              <option value="Product not delivered">Product not delivered</option>
              <option value="Other">Other</option>
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
              placeholder="Add any additional notes about this refund"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 text-sm">Refund processed successfully!</p>
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
              disabled={loading || availableForRefund <= 0}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <RefreshCcw className="h-5 w-5 mr-2" />
                  Process Refund
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRefundForm;