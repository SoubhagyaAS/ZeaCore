import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/database';

type Ticket = Tables['tickets']['Row'] & {
  category?: Tables['ticket_categories']['Row'];
  priority?: Tables['ticket_priorities']['Row'];
  status?: Tables['ticket_statuses']['Row'];
  customer?: Tables['customers']['Row'];
  app?: Tables['apps']['Row'];
  plan?: Tables['subscription_plans']['Row'];
  assigned_user?: Tables['user_profiles']['Row'];
  created_by_user?: Tables['user_profiles']['Row'];
};

type TicketCategory = Tables['ticket_categories']['Row'];
type TicketPriority = Tables['ticket_priorities']['Row'];
type TicketStatus = Tables['ticket_statuses']['Row'];

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [categories, setCategories] = useState<TicketCategory[]>([]);
  const [priorities, setPriorities] = useState<TicketPriority[]>([]);
  const [statuses, setStatuses] = useState<TicketStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          category:ticket_categories(*),
          priority:ticket_priorities(*),
          status:ticket_statuses(*),
          customer:customers(*),
          app:apps(*),
          plan:subscription_plans(*),
          assigned_user:user_profiles!tickets_assigned_to_fkey(*),
          created_by_user:user_profiles!tickets_created_by_fkey(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // If table doesn't exist, return empty array
        if (error.code === '42P01') {
          console.warn('Tickets table does not exist yet');
          setTickets([]);
          return;
        }
        throw error;
      }
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        if (error.code === '42P01') {
          console.warn('Ticket categories table does not exist yet');
          setCategories([]);
          return;
        }
        throw error;
      }
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setCategories([]);
    }
  };

  const fetchPriorities = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_priorities')
        .select('*')
        .order('level');

      if (error) {
        if (error.code === '42P01') {
          console.warn('Ticket priorities table does not exist yet');
          setPriorities([]);
          return;
        }
        throw error;
      }
      setPriorities(data || []);
    } catch (err) {
      console.error('Error fetching priorities:', err);
      setPriorities([]);
    }
  };

  const fetchStatuses = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_statuses')
        .select('*')
        .order('name');

      if (error) {
        if (error.code === '42P01') {
          console.warn('Ticket statuses table does not exist yet');
          setStatuses([]);
          return;
        }
        throw error;
      }
      setStatuses(data || []);
    } catch (err) {
      console.error('Error fetching statuses:', err);
      setStatuses([]);
    }
  };

  const createTicket = async (ticketData: Tables['tickets']['Insert']) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .insert([ticketData])
        .select()
        .single();

      if (error) throw error;
      await fetchTickets();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const updateTicket = async (id: string, updates: Tables['tickets']['Update']) => {
    try {
      const { data, error } = await supabase
        .from('tickets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      await fetchTickets();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteTicket = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tickets')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  // Get ticket statistics
  const getTicketStats = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status?.name === 'Open').length;
    const inProgress = tickets.filter(t => t.status?.name === 'In Progress').length;
    const resolved = tickets.filter(t => t.status?.name === 'Resolved').length;
    const closed = tickets.filter(t => t.status?.name === 'Closed').length;
    const critical = tickets.filter(t => t.priority?.level === 1).length;
    const high = tickets.filter(t => t.priority?.level === 2).length;

    return {
      total,
      open,
      inProgress,
      resolved,
      closed,
      critical,
      high,
      resolutionRate: total > 0 ? ((resolved + closed) / total * 100).toFixed(1) : '0'
    };
  };

  // Get tickets by status
  const getTicketsByStatus = (statusName: string) => {
    return tickets.filter(ticket => ticket.status?.name === statusName);
  };

  // Get tickets by priority
  const getTicketsByPriority = (priorityLevel: number) => {
    return tickets.filter(ticket => ticket.priority?.level === priorityLevel);
  };

  // Get tickets by category
  const getTicketsByCategory = (categoryId: string) => {
    return tickets.filter(ticket => ticket.category_id === categoryId);
  };

  useEffect(() => {
    fetchTickets();
    fetchCategories();
    fetchPriorities();
    fetchStatuses();
  }, []);

  return {
    tickets,
    categories,
    priorities,
    statuses,
    loading,
    error,
    refetch: fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
    getTicketStats,
    getTicketsByStatus,
    getTicketsByPriority,
    getTicketsByCategory
  };
} 