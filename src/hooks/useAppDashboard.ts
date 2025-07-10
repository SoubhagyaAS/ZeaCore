import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface AppDashboardData {
  monthlyRevenue: { month: string; revenue: number }[];
  customerGrowth: { month: string; customers: number }[];
  subscriptionMetrics: {
    churnRate: number;
    averageRevenue: number;
    averageLifetime: number;
  };
}

export function useAppDashboardData(appId: string) {
  const [monthlyRevenue, setMonthlyRevenue] = useState<{ month: string; revenue: number }[]>([]);
  const [customerGrowth, setCustomerGrowth] = useState<{ month: string; customers: number }[]>([]);
  const [subscriptionMetrics, setSubscriptionMetrics] = useState({
    churnRate: 0,
    averageRevenue: 0,
    averageLifetime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    if (!appId) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch app subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('customer_subscriptions')
        .select(`
          *,
          customers!inner(*)
        `)
        .eq('app_id', appId);

      if (subsError) throw subsError;

      // Fetch payments for this app
      const subscriptionIds = (subscriptions || []).map(sub => sub.id);
      const { data: payments, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('subscription_id', subscriptionIds)
        .eq('status', 'completed');

      if (paymentsError) throw paymentsError;

      // Calculate monthly revenue for last 6 months
      const last6Months = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return {
          month: date.toLocaleDateString('en-US', { month: 'short' }),
          year: date.getFullYear(),
          monthIndex: date.getMonth()
        };
      }).reverse();

      const monthlyRevenueData = last6Months.map(month => {
        const monthPayments = (payments || []).filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          return paymentDate.getMonth() === month.monthIndex && 
                 paymentDate.getFullYear() === month.year;
        });
        
        return {
          month: month.month,
          revenue: monthPayments.reduce((sum, payment) => sum + payment.amount, 0)
        };
      });

      // Calculate customer growth
      const customerGrowthData = last6Months.map(month => {
        const monthCustomers = (subscriptions || []).filter(sub => {
          const subDate = new Date(sub.created_at);
          return subDate.getMonth() <= month.monthIndex && 
                 subDate.getFullYear() <= month.year;
        });
        
        const uniqueCustomers = new Set(monthCustomers.map(sub => sub.customer_id));
        
        return {
          month: month.month,
          customers: uniqueCustomers.size
        };
      });

      // Calculate subscription metrics
      const totalRevenue = (payments || []).reduce((sum, payment) => sum + payment.amount, 0);
      const uniqueCustomers = new Set((subscriptions || []).map(sub => sub.customer_id));
      const averageRevenue = uniqueCustomers.size > 0 ? Math.round(totalRevenue / uniqueCustomers.size) : 0;

      // Calculate churn rate (simplified)
      const cancelledSubs = (subscriptions || []).filter(sub => sub.status === 'cancelled');
      const churnRate = subscriptions && subscriptions.length > 0 
        ? Math.round((cancelledSubs.length / subscriptions.length) * 100) 
        : 0;

      // Calculate average lifetime (simplified)
      const activeSubs = (subscriptions || []).filter(sub => sub.status === 'active');
      const averageLifetime = activeSubs.length > 0
        ? Math.round(activeSubs.reduce((sum, sub) => {
            const start = new Date(sub.start_date);
            const now = new Date();
            return sum + Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
          }, 0) / activeSubs.length)
        : 0;

      setMonthlyRevenue(monthlyRevenueData);
      setCustomerGrowth(customerGrowthData);
      setSubscriptionMetrics({
        churnRate,
        averageRevenue,
        averageLifetime
      });

    } catch (err) {
      console.error('Error fetching app dashboard data:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [appId]);

  return {
    monthlyRevenue,
    customerGrowth,
    subscriptionMetrics,
    loading,
    error,
    refetch: fetchDashboardData
  };
}