/*
  # Add Tickets Table for Plans Module

  This migration adds a comprehensive tickets system that integrates with the existing plans structure.
  
  Tables:
    - `tickets` - Main tickets table
    - `ticket_categories` - Ticket categories for organization
    - `ticket_priorities` - Priority levels for tickets
    - `ticket_statuses` - Status tracking for tickets
    - `ticket_comments` - Comments and updates on tickets
    - `ticket_assignments` - Assignment tracking for tickets
*/

-- Create ticket_categories table
CREATE TABLE IF NOT EXISTS ticket_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  color text DEFAULT '#3B82F6',
  icon text DEFAULT 'tag',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_priorities table
CREATE TABLE IF NOT EXISTS ticket_priorities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  level integer NOT NULL UNIQUE,
  color text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_statuses table
CREATE TABLE IF NOT EXISTS ticket_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  color text NOT NULL,
  description text,
  is_final boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create tickets table
CREATE TABLE IF NOT EXISTS tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category_id uuid REFERENCES ticket_categories(id) ON DELETE SET NULL,
  priority_id uuid REFERENCES ticket_priorities(id) ON DELETE SET NULL,
  status_id uuid REFERENCES ticket_statuses(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE SET NULL,
  assigned_to uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  created_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  due_date timestamptz,
  estimated_hours numeric DEFAULT 0,
  actual_hours numeric DEFAULT 0,
  tags text[] DEFAULT '{}',
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  content text NOT NULL,
  is_internal boolean DEFAULT false,
  attachments jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ticket_assignments table
CREATE TABLE IF NOT EXISTS ticket_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  assigned_at timestamptz DEFAULT now(),
  assigned_by uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Insert default ticket categories
INSERT INTO ticket_categories (name, description, color, icon) VALUES
  ('Bug Report', 'Software bugs and technical issues', '#EF4444', 'bug'),
  ('Feature Request', 'New feature suggestions and enhancements', '#10B981', 'plus-circle'),
  ('Support', 'General customer support inquiries', '#3B82F6', 'help-circle'),
  ('Billing', 'Payment and billing related issues', '#F59E0B', 'credit-card'),
  ('Account', 'Account management and access issues', '#8B5CF6', 'user'),
  ('Integration', 'API and third-party integration issues', '#06B6D4', 'link'),
  ('Performance', 'Performance and optimization issues', '#F97316', 'zap'),
  ('Security', 'Security and compliance concerns', '#DC2626', 'shield');

-- Insert default ticket priorities
INSERT INTO ticket_priorities (name, level, color, description) VALUES
  ('Critical', 1, '#DC2626', 'Immediate attention required'),
  ('High', 2, '#EF4444', 'High priority issue'),
  ('Medium', 3, '#F59E0B', 'Normal priority'),
  ('Low', 4, '#10B981', 'Low priority'),
  ('Info', 5, '#6B7280', 'Informational only');

-- Insert default ticket statuses
INSERT INTO ticket_statuses (name, color, description, is_final) VALUES
  ('Open', '#3B82F6', 'Ticket is open and awaiting assignment', false),
  ('In Progress', '#F59E0B', 'Work is in progress', false),
  ('On Hold', '#6B7280', 'Work is temporarily paused', false),
  ('Waiting for Customer', '#8B5CF6', 'Waiting for customer response', false),
  ('Resolved', '#10B981', 'Issue has been resolved', true),
  ('Closed', '#6B7280', 'Ticket is closed', true),
  ('Cancelled', '#EF4444', 'Ticket was cancelled', true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tickets_customer_id ON tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_tickets_app_id ON tickets(app_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status_id ON tickets(status_id);
CREATE INDEX IF NOT EXISTS idx_tickets_priority_id ON tickets(priority_id);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ticket_comments_ticket_id ON ticket_comments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_assignments_ticket_id ON ticket_assignments(ticket_id);

-- Enable Row Level Security
ALTER TABLE ticket_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_priorities ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_assignments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view all ticket data" ON ticket_categories FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all ticket data" ON ticket_priorities FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all ticket data" ON ticket_statuses FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all tickets" ON tickets FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert tickets" ON tickets FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update tickets" ON tickets FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all comments" ON ticket_comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert comments" ON ticket_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update comments" ON ticket_comments FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Users can view all assignments" ON ticket_assignments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Users can insert assignments" ON ticket_assignments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can update assignments" ON ticket_assignments FOR UPDATE USING (auth.role() = 'authenticated');

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ticket_categories_updated_at BEFORE UPDATE ON ticket_categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_priorities_updated_at BEFORE UPDATE ON ticket_priorities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_statuses_updated_at BEFORE UPDATE ON ticket_statuses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tickets_updated_at BEFORE UPDATE ON tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_ticket_comments_updated_at BEFORE UPDATE ON ticket_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 