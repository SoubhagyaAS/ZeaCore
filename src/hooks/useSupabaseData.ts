import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../types/database';

type Tables = Database['public']['Tables'];

export function useApps() {
  const [apps, setApps] = useState<Tables['apps']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchApps = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('apps')
        .select(`
          *,
          app_url,
          screenshots_urls
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApps(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  return { apps, loading, error, refetch: fetchApps };
}

export function useCustomers() {
  const [customers, setCustomers] = useState<Tables['customers']['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, refetch: fetchCustomers };
}

export function useSubscriptionPlans() {
  const [plans, setPlans] = useState<(Tables['subscription_plans']['Row'] & { app_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscription_plans')
        .select(`
          *,
          currency,
          icon_url,
          discount_percentage,
          apps!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const plansWithAppName = (data || []).map(plan => ({
        ...plan,
        app_name: (plan.apps as any).name
      }));
      
      setPlans(plansWithAppName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  return { plans, loading, error, refetch: fetchPlans };
}

export function useCustomerSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('customer_subscriptions')
        .select(`
          *,
          apps!inner(name),
          subscription_plans!inner(name, features),
          customers!inner(name, company)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const subscriptionsWithDetails = (data || []).map(sub => ({
        ...sub,
        app_name: (sub.apps as any).name,
        plan_name: (sub.subscription_plans as any).name,
        plan_features: (sub.subscription_plans as any).features || [],
        customer_name: (sub.customers as any).name,
        customer_company: (sub.customers as any).company
      }));
      
      setSubscriptions(subscriptionsWithDetails);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  return { subscriptions, loading, error, refetch: fetchSubscriptions };
}

export function usePayments() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          customers!inner(name, company),
          customer_subscriptions!inner(
            apps!inner(name),
            subscription_plans!inner(name)
          )
        `)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      
      const paymentsWithDetails = (data || []).map(payment => ({
        ...payment,
        customer_name: (payment.customers as any).name,
        customer_company: (payment.customers as any).company,
        app_name: (payment.customer_subscriptions as any).apps.name,
        plan_name: (payment.customer_subscriptions as any).subscription_plans.name
      }));
      
      setPayments(paymentsWithDetails);
    } catch (err) {
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

export function useFeatures() {
  const [features, setFeatures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_features')
        .select(`
          *,
          apps!inner(name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const featuresWithAppName = (data || []).map(feature => ({
        ...feature,
        app_name: (feature.apps as any).name
      }));
      
      setFeatures(featuresWithAppName);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  return { features, loading, error, refetch: fetchFeatures };
}