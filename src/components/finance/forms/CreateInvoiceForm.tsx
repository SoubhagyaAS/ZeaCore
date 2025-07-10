import React, { useState, useEffect } from 'react';
import { X, Receipt, Building, Calendar, DollarSign, Plus, Trash2, Loader2 } from 'lucide-react';
import { useCustomers, useApps, useCustomerSubscriptions } from '../../../hooks/useSupabaseData';
import { useCreateInvoice } from '../../../hooks/useFinance';

interface CreateInvoiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateInvoiceForm: React.FC<CreateInvoiceFormProps> = ({ isOpen, onClose, onSuccess }) => {
  const { customers } = useCustomers();
  const { apps } = useApps();
  const { subscriptions } = useCustomerSubscriptions();
  const { createInvoice, loading, error, success } = useCreateInvoice();

  const [formData, setFormData] = useState({
    customer_id: '',
    subscription_id: '',
    tax_amount: '',
    discount_amount: '',
    due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: '',
    invoice_type: 'one-time' as 'subscription' | 'one-time',
    billing_period_start: new Date().toISOString().split('T')[0],
    billing_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [invoiceItems, setInvoiceItems] = useState([
    { description: '', quantity: 1, unit_price: 0, app_id: '', feature_id: '' }
  ]);

  const [customerSubscriptions, setCustomerSubscriptions] = useState<any[]>([]);
  const [selectedApp, setSelectedApp] = useState('');

  // Update customer subscriptions when customer changes
  useEffect(() => {
    if (formData.customer_id) {
      const filteredSubscriptions = subscriptions.filter(
        sub => sub.customer_id === formData.customer_id && sub.status === 'active'
      );
      setCustomerSubscriptions(filteredSubscriptions);
      
      // Reset subscription selection
      setFormData(prev => ({
        ...prev,
        subscription_id: ''
      }));
    } else {
      setCustomerSubscriptions([]);
    }
  }, [formData.customer_id, subscriptions]);

  // Update form when subscription changes
  useEffect(() => {
    if (formData.subscription_id) {
      const selectedSubscription = subscriptions.find(sub => sub.id === formData.subscription_id);
      if (selectedSubscription) {
        setSelectedApp(selectedSubscription.app_id);
        
        // Pre-fill invoice item with subscription details
        setInvoiceItems([{
          description: `${selectedSubscription.plan_name} Subscription`,
          quantity: 1,
          unit_price: selectedSubscription.price,
          app_id: selectedSubscription.app_id,
          feature_id: ''
        }]);
        
        // Set invoice type to subscription
        setFormData(prev => ({
          ...prev,
          invoice_type: 'subscription'
        }));
      }
    }
  }, [formData.subscription_id, subscriptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.customer_id) {
      alert('Please select a customer');
      return;
    }
    
    if (invoiceItems.some(item => !item.description || item.quantity <= 0 || item.unit_price <= 0)) {
      alert('Please fill in all invoice items with valid quantities and prices');
      return;
    }
    
    // Create invoice
    const invoiceId = await createInvoice(
      formData.customer_id,
      {
        subscription_id: formData.subscription_id || undefined,
        tax_amount: parseFloat(formData.tax_amount) || 0,
        discount_amount: parseFloat(formData.discount_amount) || 0,
        due_date: formData.due_date,
        notes: formData.notes || undefined,
        invoice_type: formData.invoice_type,
        billing_period_start: formData.invoice_type === 'subscription' ? formData.billing_period_start : undefined,
        billing_period_end: formData.invoice_type === 'subscription' ? formData.billing_period_end : undefined
      },
      invoiceItems.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        app_id: item.app_id || undefined,
        feature_id: item.feature_id || undefined
      }))
    );
    
    if (invoiceId) {
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

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...invoiceItems];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'quantity' || field === 'unit_price' ? parseFloat(value) || 0 : value
    };
    setInvoiceItems(updatedItems);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([
      ...invoiceItems,
      { description: '', quantity: 1, unit_price: 0, app_id: selectedApp, feature_id: '' }
    ]);
  };

  const removeInvoiceItem = (index: number) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter((_, i) => i !== index));
    }
  };

  // Calculate totals
  const subtotal = invoiceItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
  const taxAmount = parseFloat(formData.tax_amount) || 0;
  const discountAmount = parseFloat(formData.discount_amount) || 0;
  const total = subtotal + taxAmount - discountAmount;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-soft-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-light-gray">
          <h2 className="text-2xl font-bold text-charcoal">Create New Invoice</h2>
          <button
            onClick={onClose}
            className="text-charcoal-light hover:text-charcoal transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Customer & Subscription Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                className="input-field"
              >
                <option value="">Select Customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.company} ({customer.name})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <Receipt className="h-4 w-4 inline mr-1" />
                Subscription (Optional)
              </label>
              <select
                name="subscription_id"
                value={formData.subscription_id}
                onChange={handleChange}
                disabled={!formData.customer_id}
                className="input-field"
              >
                <option value="">No Subscription (One-time Invoice)</option>
                {customerSubscriptions.map(subscription => (
                  <option key={subscription.id} value={subscription.id}>
                    {subscription.app_name} - {subscription.plan_name}
                  </option>
                ))}
              </select>
              {!formData.customer_id && (
                <p className="text-xs text-charcoal-light mt-1">Select a customer first</p>
              )}
            </div>
          </div>

          {/* Invoice Type & Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Invoice Type
              </label>
              <select
                name="invoice_type"
                value={formData.invoice_type}
                onChange={handleChange}
                className="input-field"
              >
                <option value="one-time">One-time Invoice</option>
                <option value="subscription">Subscription Invoice</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                required
                className="input-field"
              />
            </div>

            {formData.invoice_type === 'subscription' && (
              <div>
                <label className="block text-sm font-medium text-charcoal mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Billing Period
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    name="billing_period_start"
                    value={formData.billing_period_start}
                    onChange={handleChange}
                    className="input-field w-1/2"
                  />
                  <input
                    type="date"
                    name="billing_period_end"
                    value={formData.billing_period_end}
                    onChange={handleChange}
                    className="input-field w-1/2"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal">Invoice Items</h3>
              <button
                type="button"
                onClick={addInvoiceItem}
                className="btn-secondary text-sm py-2 px-3"
              >
                <Plus className="h-4 w-4 mr-1 inline" />
                Add Item
              </button>
            </div>
            
            <div className="space-y-4">
              {invoiceItems.map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 items-center bg-light-gray p-4 rounded-xl">
                  <div className="col-span-5">
                    <label className="block text-xs font-medium text-charcoal-light mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                      required
                      className="input-field"
                      placeholder="Item description"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-charcoal-light mb-1">
                      Quantity
                    </label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      required
                      min="1"
                      step="1"
                      className="input-field"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-charcoal-light mb-1">
                      Unit Price
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light h-4 w-4" />
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        required
                        min="0"
                        step="0.01"
                        className="input-field pl-8"
                      />
                    </div>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-charcoal-light mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light h-4 w-4" />
                      <input
                        type="text"
                        value={(item.quantity * item.unit_price).toFixed(2)}
                        readOnly
                        className="input-field pl-8 bg-gray-100"
                      />
                    </div>
                  </div>
                  <div className="col-span-1 flex items-end justify-center h-full">
                    <button
                      type="button"
                      onClick={() => removeInvoiceItem(index)}
                      disabled={invoiceItems.length === 1}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* App Selection */}
          <div>
            <label className="block text-sm font-medium text-charcoal mb-2">
              Associated App (Optional)
            </label>
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="input-field"
            >
              <option value="">No App Selected</option>
              {apps.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>

          {/* Totals */}
          <div className="bg-light-gray rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="text-charcoal font-medium">Subtotal</div>
                <div className="text-charcoal font-medium">${subtotal.toFixed(2)}</div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-charcoal font-medium">Tax</div>
                <div className="relative w-32">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light h-4 w-4" />
                  <input
                    type="number"
                    name="tax_amount"
                    value={formData.tax_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input-field pl-8 text-right"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-charcoal font-medium">Discount</div>
                <div className="relative w-32">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-charcoal-light h-4 w-4" />
                  <input
                    type="number"
                    name="discount_amount"
                    value={formData.discount_amount}
                    onChange={handleChange}
                    min="0"
                    step="0.01"
                    className="input-field pl-8 text-right"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-300 pt-4 flex justify-between items-center">
                <div className="text-charcoal font-bold text-lg">Total</div>
                <div className="text-charcoal font-bold text-lg">${total.toFixed(2)}</div>
              </div>
            </div>
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
              placeholder="Add any notes or special instructions for this invoice"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <p className="text-green-800 text-sm">Invoice created successfully!</p>
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
                  <Receipt className="h-5 w-5 mr-2" />
                  Create Invoice
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInvoiceForm;