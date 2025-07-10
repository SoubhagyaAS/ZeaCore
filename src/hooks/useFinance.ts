import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Invoice {
  id: string;
  customer_id: string;
  subscription_id: string | null;
  invoice_number: string;
  amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  due_date: string;
  issue_date: string;
  paid_date: string | null;
  notes: string | null;
  invoice_type: 'subscription' | 'one-time';
  billing_period_start: string | null;
  billing_period_end: string | null;
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_company?: string;
  customer_email?: string;
  subscription_plan_name?: string;
  app_name?: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  app_id: string | null;
  feature_id: string | null;
  created_at: string;
  app_name?: string;
  feature_name?: string;
}

export interface PaymentMethod {
  id: string;
  customer_id: string;
  method_type: 'card' | 'bank_transfer' | 'paypal' | 'cash' | 'check' | 'other';
  is_default: boolean;
  details: any;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
  customer_name?: string;
  customer_company?: string;
}

export interface PaymentTransaction {
  id: string;
  invoice_id: string | null;
  customer_id: string;
  payment_method_id: string | null;
  amount: number;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transaction_date: string;
  transaction_reference: string | null;
  gateway: string;
  gateway_response: any;
  notes: string | null;
  created_at: string;
  customer_name?: string;
  customer_company?: string;
  invoice_number?: string;
  payment_method_type?: string;
}

export interface Refund {
  id: string;
  payment_transaction_id: string;
  invoice_id: string | null;
  amount: number;
  reason: string;
  status: 'pending' | 'completed' | 'rejected';
  refund_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  customer_id?: string;
  customer_name?: string;
  customer_company?: string;
  invoice_number?: string;
  transaction_reference?: string;
}

export interface FinancialSummary {
  totalRevenue: number;
  outstandingAmount: number;
  paidInvoices: number;
  overdueInvoices: number;
  monthlyRecurringRevenue: number;
  yearlyRecurringRevenue: number;
  revenueByMonth: { month: string; revenue: number }[];
  revenueByApp: { app_name: string; revenue: number }[];
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!inner(name, company, email),
          customer_subscriptions(subscription_plans(name), apps(name))
        `)
        .order('issue_date', { ascending: false });

      if (error) throw error;
      
      const invoicesWithDetails = (data || []).map(invoice => ({
        ...invoice,
        customer_name: (invoice.customers as any).name,
        customer_company: (invoice.customers as any).company,
        customer_email: (invoice.customers as any).email,
        subscription_plan_name: invoice.customer_subscriptions?.subscription_plans?.name,
        app_name: invoice.customer_subscriptions?.apps?.name
      }));
      
      setInvoices(invoicesWithDetails);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  return { invoices, loading, error, refetch: fetchInvoices };
}

export function useInvoiceDetails(invoiceId: string | null) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoiceDetails = async () => {
    if (!invoiceId) {
      setInvoice(null);
      setInvoiceItems([]);
      setPayments([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch invoice with related data
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          *,
          customers!inner(name, company, email),
          customer_subscriptions(subscription_plans(name), apps(name))
        `)
        .eq('id', invoiceId)
        .single();

      if (invoiceError) throw invoiceError;
      
      // Fetch invoice items
      const { data: itemsData, error: itemsError } = await supabase
        .from('invoice_items')
        .select(`
          *,
          apps(name),
          app_features(name)
        `)
        .eq('invoice_id', invoiceId);

      if (itemsError) throw itemsError;
      
      // Fetch payments for this invoice
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          customers(name, company),
          payment_methods(method_type)
        `)
        .eq('invoice_id', invoiceId);

      if (paymentsError) throw paymentsError;
      
      // Process and set data
      const invoiceWithDetails = {
        ...invoiceData,
        customer_name: (invoiceData.customers as any).name,
        customer_company: (invoiceData.customers as any).company,
        customer_email: (invoiceData.customers as any).email,
        subscription_plan_name: invoiceData.customer_subscriptions?.subscription_plans?.name,
        app_name: invoiceData.customer_subscriptions?.apps?.name
      };
      
      const itemsWithDetails = (itemsData || []).map(item => ({
        ...item,
        app_name: item.apps?.name,
        feature_name: item.app_features?.name
      }));
      
      const paymentsWithDetails = (paymentsData || []).map(payment => ({
        ...payment,
        customer_name: payment.customers?.name,
        customer_company: payment.customers?.company,
        payment_method_type: payment.payment_methods?.method_type
      }));
      
      setInvoice(invoiceWithDetails);
      setInvoiceItems(itemsWithDetails);
      setPayments(paymentsWithDetails);
    } catch (err) {
      console.error('Error fetching invoice details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceDetails();
  }, [invoiceId]);

  return { invoice, invoiceItems, payments, loading, error, refetch: fetchInvoiceDetails };
}

export function usePaymentMethods(customerId?: string) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('payment_methods')
        .select(`
          *,
          customers!inner(name, company)
        `)
        .order('created_at', { ascending: false });
      
      if (customerId) {
        query = query.eq('customer_id', customerId);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const methodsWithDetails = (data || []).map(method => ({
        ...method,
        customer_name: (method.customers as any).name,
        customer_company: (method.customers as any).company
      }));
      
      setPaymentMethods(methodsWithDetails);
    } catch (err) {
      console.error('Error fetching payment methods:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentMethods();
  }, [customerId]);

  return { paymentMethods, loading, error, refetch: fetchPaymentMethods };
}

export function usePaymentTransactions() {
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          customers!inner(name, company),
          payment_methods(method_type),
          invoices(invoice_number)
        `)
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      
      const paymentsWithDetails = (data || []).map(payment => ({
        ...payment,
        customer_name: (payment.customers as any).name,
        customer_company: (payment.customers as any).company,
        payment_method_type: payment.payment_methods?.method_type,
        invoice_number: payment.invoices?.invoice_number
      }));
      
      setPayments(paymentsWithDetails);
    } catch (err) {
      console.error('Error fetching payments:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  return { payments, loading, error, refetch: fetchPayments };
}

export function usePaymentDetails(paymentId: string | null) {
  const [payment, setPayment] = useState<PaymentTransaction | null>(null);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPaymentDetails = async () => {
    if (!paymentId) {
      setPayment(null);
      setRefunds([]);
      setInvoice(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch payment with related data
      const { data: paymentData, error: paymentError } = await supabase
        .from('payment_transactions')
        .select(`
          *,
          customers!inner(name, company, email),
          payment_methods(method_type, details),
          invoices(*)
        `)
        .eq('id', paymentId)
        .single();

      if (paymentError) throw paymentError;
      
      // Fetch refunds for this payment
      const { data: refundsData, error: refundsError } = await supabase
        .from('refunds')
        .select(`
          *,
          invoices(invoice_number)
        `)
        .eq('payment_transaction_id', paymentId);

      if (refundsError) throw refundsError;
      
      // Process and set data
      const paymentWithDetails = {
        ...paymentData,
        customer_name: (paymentData.customers as any).name,
        customer_company: (paymentData.customers as any).company,
        customer_email: (paymentData.customers as any).email,
        payment_method_type: paymentData.payment_methods?.method_type,
        payment_method_details: paymentData.payment_methods?.details
      };
      
      const refundsWithDetails = (refundsData || []).map(refund => ({
        ...refund,
        invoice_number: refund.invoices?.invoice_number
      }));
      
      setPayment(paymentWithDetails);
      setRefunds(refundsWithDetails);
      setInvoice(paymentData.invoices);
    } catch (err) {
      console.error('Error fetching payment details:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [paymentId]);

  return { payment, refunds, invoice, loading, error, refetch: fetchPaymentDetails };
}

export function useRefunds() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('refunds')
        .select(`
          *,
          payment_transactions!inner(
            transaction_reference,
            customer_id,
            customers(name, company)
          ),
          invoices(invoice_number)
        `)
        .order('refund_date', { ascending: false });

      if (error) throw error;
      
      const refundsWithDetails = (data || []).map(refund => ({
        ...refund,
        customer_id: refund.payment_transactions.customer_id,
        customer_name: refund.payment_transactions.customers.name,
        customer_company: refund.payment_transactions.customers.company,
        transaction_reference: refund.payment_transactions.transaction_reference,
        invoice_number: refund.invoices?.invoice_number
      }));
      
      setRefunds(refundsWithDetails);
    } catch (err) {
      console.error('Error fetching refunds:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  return { refunds, loading, error, refetch: fetchRefunds };
}

export function useFinancialSummary() {
  const [summary, setSummary] = useState<FinancialSummary>({
    totalRevenue: 0,
    outstandingAmount: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    monthlyRecurringRevenue: 0,
    yearlyRecurringRevenue: 0,
    revenueByMonth: [],
    revenueByApp: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFinancialSummary = async () => {
    try {
      setLoading(true);
      
      // Fetch invoices for revenue calculation
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select(`
          *,
          customer_subscriptions(
            apps(name),
            billing,
            price
          )
        `);

      if (invoicesError) throw invoicesError;
      
      // Fetch payment transactions for actual revenue
      const { data: payments, error: paymentsError } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;
      
      // Calculate total revenue from completed payments
      const totalRevenue = (payments || []).reduce((sum, payment) => sum + payment.amount, 0);
      
      // Calculate outstanding amount from unpaid invoices
      const outstandingAmount = (invoices || [])
        .filter(invoice => invoice.status === 'sent' || invoice.status === 'overdue')
        .reduce((sum, invoice) => sum + invoice.total_amount, 0);
      
      // Count paid and overdue invoices
      const paidInvoices = (invoices || []).filter(invoice => invoice.status === 'paid').length;
      const overdueInvoices = (invoices || []).filter(invoice => invoice.status === 'overdue').length;
      
      // Calculate recurring revenue
      const activeSubscriptionInvoices = (invoices || [])
        .filter(invoice => 
          invoice.invoice_type === 'subscription' && 
          invoice.status !== 'cancelled'
        );
      
      const monthlyRecurringRevenue = activeSubscriptionInvoices
        .filter(invoice => invoice.customer_subscriptions?.billing === 'monthly')
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      
      const yearlyRecurringRevenue = activeSubscriptionInvoices
        .filter(invoice => invoice.customer_subscriptions?.billing === 'yearly')
        .reduce((sum, invoice) => sum + (invoice.amount / 12), 0);
      
      // Calculate revenue by month for the last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          monthIndex: date.getMonth()
        };
      }).reverse();
      
      const revenueByMonth = last6Months.map(month => {
        const monthPayments = (payments || []).filter(payment => {
          const paymentDate = new Date(payment.transaction_date);
          return paymentDate.getMonth() === month.monthIndex && 
                 paymentDate.getFullYear() === month.year;
        });
        
        return {
          month: month.month,
          revenue: monthPayments.reduce((sum, payment) => sum + payment.amount, 0)
        };
      });
      
      // Calculate revenue by app
      const revenueByApp: { app_name: string; revenue: number }[] = [];
      
      (invoices || []).forEach(invoice => {
        if (invoice.status === 'paid' && invoice.customer_subscriptions?.apps?.name) {
          const appName = invoice.customer_subscriptions.apps.name;
          const existingApp = revenueByApp.find(a => a.app_name === appName);
          
          if (existingApp) {
            existingApp.revenue += invoice.amount;
          } else {
            revenueByApp.push({
              app_name: appName,
              revenue: invoice.amount
            });
          }
        }
      });
      
      revenueByApp.sort((a, b) => b.revenue - a.revenue);
      
      setSummary({
        totalRevenue,
        outstandingAmount,
        paidInvoices,
        overdueInvoices,
        monthlyRecurringRevenue,
        yearlyRecurringRevenue,
        revenueByMonth,
        revenueByApp
      });
    } catch (err) {
      console.error('Error fetching financial summary:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialSummary();
  }, []);

  return { summary, loading, error, refetch: fetchFinancialSummary };
}

export function useCreateInvoice() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createInvoice = async (
    customerId: string,
    invoiceData: {
      subscription_id?: string;
      tax_amount?: number;
      discount_amount?: number;
      due_date?: string;
      notes?: string;
      invoice_type: 'subscription' | 'one-time';
      billing_period_start?: string;
      billing_period_end?: string;
    },
    invoiceItems: {
      description: string;
      quantity: number;
      unit_price: number;
      app_id?: string;
      feature_id?: string;
    }[]
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      // Calculate amounts
      const itemsTotal = invoiceItems.reduce(
        (sum, item) => sum + (item.quantity * item.unit_price), 
        0
      );
      
      const taxAmount = invoiceData.tax_amount || 0;
      const discountAmount = invoiceData.discount_amount || 0;
      const totalAmount = itemsTotal + taxAmount - discountAmount;
      
      // Set due date if not provided
      const dueDate = invoiceData.due_date || 
        new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{
          customer_id: customerId,
          subscription_id: invoiceData.subscription_id || null,
          amount: itemsTotal,
          tax_amount: taxAmount,
          discount_amount: discountAmount,
          total_amount: totalAmount,
          status: 'draft',
          due_date: dueDate,
          issue_date: new Date().toISOString().split('T')[0],
          notes: invoiceData.notes || null,
          invoice_type: invoiceData.invoice_type,
          billing_period_start: invoiceData.billing_period_start || null,
          billing_period_end: invoiceData.billing_period_end || null
        }])
        .select()
        .single();

      if (invoiceError) throw invoiceError;
      
      // Create invoice items
      const invoiceItemsWithAmount = invoiceItems.map(item => ({
        ...item,
        invoice_id: invoice.id,
        amount: item.quantity * item.unit_price,
        app_id: item.app_id || null,
        feature_id: item.feature_id || null
      }));
      
      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(invoiceItemsWithAmount);

      if (itemsError) throw itemsError;
      
      setSuccess(true);
      return invoice.id;
    } catch (err) {
      console.error('Error creating invoice:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createInvoice, loading, error, success };
}

export function useUpdateInvoiceStatus() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateInvoiceStatus = async (
    invoiceId: string,
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      // If marking as paid, set the paid date
      if (status === 'paid') {
        updateData.paid_date = new Date().toISOString().split('T')[0];
      }
      
      const { error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId);

      if (error) throw error;
      
      setSuccess(true);
      return true;
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateInvoiceStatus, loading, error, success };
}

export function useCreatePayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createPayment = async (
    paymentData: {
      invoice_id?: string;
      customer_id: string;
      payment_method_id?: string;
      amount: number;
      transaction_reference?: string;
      gateway: string;
      gateway_response?: any;
      notes?: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const { data: payment, error: paymentError } = await supabase
        .from('payment_transactions')
        .insert([{
          invoice_id: paymentData.invoice_id || null,
          customer_id: paymentData.customer_id,
          payment_method_id: paymentData.payment_method_id || null,
          amount: paymentData.amount,
          status: 'completed',
          transaction_date: new Date().toISOString(),
          transaction_reference: paymentData.transaction_reference || null,
          gateway: paymentData.gateway,
          gateway_response: paymentData.gateway_response || null,
          notes: paymentData.notes || null
        }])
        .select()
        .single();

      if (paymentError) throw paymentError;
      
      setSuccess(true);
      return payment.id;
    } catch (err) {
      console.error('Error creating payment:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createPayment, loading, error, success };
}

export function useCreateRefund() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createRefund = async (
    refundData: {
      payment_transaction_id: string;
      invoice_id?: string;
      amount: number;
      reason: string;
      notes?: string;
    }
  ) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const { data: refund, error: refundError } = await supabase
        .from('refunds')
        .insert([{
          payment_transaction_id: refundData.payment_transaction_id,
          invoice_id: refundData.invoice_id || null,
          amount: refundData.amount,
          reason: refundData.reason,
          status: 'completed',
          refund_date: new Date().toISOString(),
          notes: refundData.notes || null
        }])
        .select()
        .single();

      if (refundError) throw refundError;
      
      setSuccess(true);
      return refund.id;
    } catch (err) {
      console.error('Error creating refund:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { createRefund, loading, error, success };
}