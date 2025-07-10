export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      apps: {
        Row: {
          id: string
          name: string
          description: string
          category: string
          status: string
          features: string[]
          api_endpoint: string | null
          api_key: string | null
          app_url: string | null
          screenshots_urls: string[]
          version: string
          subscribers: number
          revenue: number
          logo_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          category: string
          status?: string
          features?: string[]
          api_endpoint?: string | null
          api_key?: string | null
          app_url?: string | null
          screenshots_urls?: string[]
          version?: string
          subscribers?: number
          revenue?: number
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          category?: string
          status?: string
          features?: string[]
          api_endpoint?: string | null
          api_key?: string | null
          app_url?: string | null
          screenshots_urls?: string[]
          version?: string
          subscribers?: number
          revenue?: number
          logo_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      app_features: {
        Row: {
          id: string
          name: string
          description: string | null
          app_id: string
          feature_type: string
          base_price: number
          status: string
          is_default: boolean
          feature_code: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          app_id: string
          feature_type?: string
          base_price?: number
          status?: string
          is_default?: boolean
          feature_code?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          app_id?: string
          feature_type?: string
          base_price?: number
          status?: string
          is_default?: boolean
          feature_code?: string | null
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      subscription_plans: {
        Row: {
          id: string
          name: string
          app_id: string
          price: number
          billing: string
          features: string[]
          max_users: number
          description: string | null
          is_popular: boolean
          currency: string
          icon_url: string | null
          discount_percentage: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          app_id: string
          price?: number
          billing?: string
          features?: string[]
          max_users?: number
          description?: string | null
          is_popular?: boolean
          currency?: string
          icon_url?: string | null
          discount_percentage?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          app_id?: string
          price?: number
          billing?: string
          features?: string[]
          max_users?: number
          description?: string | null
          is_popular?: boolean
          currency?: string
          icon_url?: string | null
          discount_percentage?: number
          created_at?: string
          updated_at?: string
        }
      }
      customers: {
        Row: {
          id: string
          name: string
          email: string
          company: string
          status: string
          total_spent: number
          logo_url: string | null
          country: string | null
          state: string | null
          phone: string | null
          website: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          company: string
          status?: string
          total_spent?: number
          logo_url?: string | null
          country?: string | null
          state?: string | null
          phone?: string | null
          website?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          company?: string
          status?: string
          total_spent?: number
          logo_url?: string | null
          country?: string | null
          state?: string | null
          phone?: string | null
          website?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      customer_subscriptions: {
        Row: {
          id: string
          customer_id: string
          app_id: string
          plan_id: string
          status: string
          start_date: string
          end_date: string
          price: number
          billing: string
          enabled_features: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          app_id: string
          plan_id: string
          status?: string
          start_date?: string
          end_date: string
          price?: number
          billing?: string
          enabled_features?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          app_id?: string
          plan_id?: string
          status?: string
          start_date?: string
          end_date?: string
          price?: number
          billing?: string
          enabled_features?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          customer_id: string
          subscription_id: string
          amount: number
          status: string
          payment_date: string
          payment_method: string
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          subscription_id: string
          amount: number
          status?: string
          payment_date?: string
          payment_method?: string
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          subscription_id?: string
          amount?: number
          status?: string
          payment_date?: string
          payment_method?: string
          created_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          email: string
          first_name: string
          last_name: string
          avatar_url: string | null
          phone: string | null
          department: string | null
          job_title: string | null
          role_id: string | null
          status: string
          last_login: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          first_name: string
          last_name: string
          avatar_url?: string | null
          phone?: string | null
          department?: string | null
          job_title?: string | null
          role_id?: string | null
          status?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          first_name?: string
          last_name?: string
          avatar_url?: string | null
          phone?: string | null
          department?: string | null
          job_title?: string | null
          role_id?: string | null
          status?: string
          last_login?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      access_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          resource: string
          resource_id: string | null
          resource_name: string | null
          ip_address: string | null
          user_agent: string | null
          request_method: string | null
          request_url: string | null
          request_body: Json | null
          response_status: number | null
          response_body: Json | null
          session_id: string | null
          browser_info: Json | null
          location_info: Json | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          resource: string
          resource_id?: string | null
          resource_name?: string | null
          ip_address?: string | null
          user_agent?: string | null
          request_method?: string | null
          request_url?: string | null
          request_body?: Json | null
          response_status?: number | null
          response_body?: Json | null
          session_id?: string | null
          browser_info?: Json | null
          location_info?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          resource?: string
          resource_id?: string | null
          resource_name?: string | null
          ip_address?: string | null
          user_agent?: string | null
          request_method?: string | null
          request_url?: string | null
          request_body?: Json | null
          response_status?: number | null
          response_body?: Json | null
          session_id?: string | null
          browser_info?: Json | null
          location_info?: Json | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_categories: {
        Row: {
          id: string
          name: string
          description: string | null
          color: string
          icon: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      ticket_priorities: {
        Row: {
          id: string
          name: string
          level: number
          color: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          level: number
          color: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          level?: number
          color?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_statuses: {
        Row: {
          id: string
          name: string
          color: string
          description: string | null
          is_final: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          description?: string | null
          is_final?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          description?: string | null
          is_final?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          title: string
          description: string
          category_id: string | null
          priority_id: string | null
          status_id: string | null
          customer_id: string
          app_id: string
          plan_id: string | null
          assigned_to: string | null
          created_by: string | null
          due_date: string | null
          estimated_hours: number
          actual_hours: number
          tags: string[]
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          category_id?: string | null
          priority_id?: string | null
          status_id?: string | null
          customer_id: string
          app_id: string
          plan_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          estimated_hours?: number
          actual_hours?: number
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          category_id?: string | null
          priority_id?: string | null
          status_id?: string | null
          customer_id?: string
          app_id?: string
          plan_id?: string | null
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          estimated_hours?: number
          actual_hours?: number
          tags?: string[]
          metadata?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ticket_comments: {
        Row: {
          id: string
          ticket_id: string
          user_id: string | null
          content: string
          is_internal: boolean
          attachments: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id?: string | null
          content: string
          is_internal?: boolean
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string | null
          content?: string
          is_internal?: boolean
          attachments?: Json
          created_at?: string
          updated_at?: string
        }
      }
      ticket_assignments: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          assigned_at: string
          assigned_by: string | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          assigned_at?: string
          assigned_by?: string | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          assigned_at?: string
          assigned_by?: string | null
          notes?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}