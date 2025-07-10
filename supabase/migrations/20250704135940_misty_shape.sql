/*
  # Finance Module Schema

  1. New Tables
    - `invoices`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `subscription_id` (uuid, foreign key, nullable)
      - `invoice_number` (text, unique)
      - `amount` (numeric)
      - `tax_amount` (numeric)
      - `discount_amount` (numeric)
      - `total_amount` (numeric)
      - `status` (text)
      - `due_date` (date)
      - `issue_date` (date)
      - `paid_date` (date, nullable)
      - `notes` (text, nullable)
      - `invoice_type` (text)
      - `billing_period_start` (date, nullable)
      - `billing_period_end` (date, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `invoice_items`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key)
      - `description` (text)
      - `quantity` (numeric)
      - `unit_price` (numeric)
      - `amount` (numeric)
      - `app_id` (uuid, foreign key, nullable)
      - `feature_id` (uuid, foreign key, nullable)
      - `created_at` (timestamp)

    - `payment_methods`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `method_type` (text)
      - `is_default` (boolean)
      - `details` (jsonb)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `payment_transactions`
      - `id` (uuid, primary key)
      - `invoice_id` (uuid, foreign key, nullable)
      - `customer_id` (uuid, foreign key)
      - `payment_method_id` (uuid, foreign key, nullable)
      - `amount` (numeric)
      - `status` (text)
      - `transaction_date` (timestamp)
      - `transaction_reference` (text, nullable)
      - `gateway` (text)
      - `gateway_response` (jsonb, nullable)
      - `notes` (text, nullable)
      - `created_at` (timestamp)

    - `refunds`
      - `id` (uuid, primary key)
      - `payment_transaction_id` (uuid, foreign key)
      - `invoice_id` (uuid, foreign key, nullable)
      - `amount` (numeric)
      - `reason` (text)
      - `status` (text)
      - `refund_date` (timestamp)
      - `notes` (text, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage financial data

  3. Triggers and Functions
    - Auto-generate invoice numbers
    - Update invoice totals when items change
    - Update payment and refund statuses
    - Generate invoices for new subscriptions
*/

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES customer_subscriptions(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'draft',
  due_date date NOT NULL,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  paid_date date,
  notes text,
  invoice_type text NOT NULL DEFAULT 'subscription',
  billing_period_start date,
  billing_period_end date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create invoice_items table
CREATE TABLE IF NOT EXISTS invoice_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  app_id uuid REFERENCES apps(id) ON DELETE SET NULL,
  feature_id uuid REFERENCES app_features(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create payment_methods table
CREATE TABLE IF NOT EXISTS payment_methods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  method_type text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  details jsonb NOT NULL DEFAULT '{}',
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  payment_method_id uuid REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  transaction_date timestamptz NOT NULL DEFAULT now(),
  transaction_reference text,
  gateway text NOT NULL,
  gateway_response jsonb,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create refunds table
CREATE TABLE IF NOT EXISTS refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_transaction_id uuid NOT NULL REFERENCES payment_transactions(id) ON DELETE CASCADE,
  invoice_id uuid REFERENCES invoices(id) ON DELETE SET NULL,
  amount numeric NOT NULL,
  reason text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  refund_date timestamptz NOT NULL DEFAULT now(),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add constraints
ALTER TABLE invoices ADD CONSTRAINT check_invoice_status 
  CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled'));

ALTER TABLE invoices ADD CONSTRAINT check_invoice_type 
  CHECK (invoice_type IN ('subscription', 'one-time'));

ALTER TABLE payment_methods ADD CONSTRAINT check_payment_method_status 
  CHECK (status IN ('active', 'inactive'));

ALTER TABLE payment_methods ADD CONSTRAINT check_payment_method_type 
  CHECK (method_type IN ('card', 'bank_transfer', 'paypal', 'cash', 'check', 'other'));

ALTER TABLE payment_transactions ADD CONSTRAINT check_transaction_status 
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded'));

ALTER TABLE refunds ADD CONSTRAINT check_refund_status 
  CHECK (status IN ('pending', 'completed', 'rejected'));

-- Enable Row Level Security
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read invoices"
  ON invoices FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage invoices"
  ON invoices FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read invoice items"
  ON invoice_items FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage invoice items"
  ON invoice_items FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read payment methods"
  ON payment_methods FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage payment methods"
  ON payment_methods FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read payment transactions"
  ON payment_transactions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage payment transactions"
  ON payment_transactions FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read refunds"
  ON refunds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage refunds"
  ON refunds FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_issue_date ON invoices(issue_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_type ON invoices(invoice_type);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_app_id ON invoice_items(app_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_feature_id ON invoice_items(feature_id);

CREATE INDEX IF NOT EXISTS idx_payment_methods_customer_id ON payment_methods(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_methods_status ON payment_methods(status);
CREATE INDEX IF NOT EXISTS idx_payment_methods_is_default ON payment_methods(is_default);

CREATE INDEX IF NOT EXISTS idx_payment_transactions_invoice_id ON payment_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_customer_id ON payment_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_date ON payment_transactions(transaction_date);

CREATE INDEX IF NOT EXISTS idx_refunds_payment_transaction_id ON refunds(payment_transaction_id);
CREATE INDEX IF NOT EXISTS idx_refunds_invoice_id ON refunds(invoice_id);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON refunds(status);

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix TEXT := 'INV-';
  year_month TEXT;
  sequence_number INT;
  new_invoice_number TEXT;
BEGIN
  -- Get current year and month (YYYYMM format)
  year_month := to_char(CURRENT_DATE, 'YYYYMM');
  
  -- Get the next sequence number for this month
  SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM '^INV-[0-9]{6}-([0-9]+)$')::INT), 0) + 1
  INTO sequence_number
  FROM invoices
  WHERE invoice_number LIKE 'INV-' || year_month || '-%';
  
  -- Format the new invoice number
  new_invoice_number := prefix || year_month || '-' || LPAD(sequence_number::TEXT, 4, '0');
  
  -- Set the new invoice number
  NEW.invoice_number := new_invoice_number;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate invoice numbers
CREATE TRIGGER before_insert_invoices
  BEFORE INSERT ON invoices
  FOR EACH ROW
  WHEN (NEW.invoice_number IS NULL)
  EXECUTE FUNCTION generate_invoice_number();

-- Create function to update invoice totals
CREATE OR REPLACE FUNCTION update_invoice_totals()
RETURNS TRIGGER AS $$
DECLARE
  invoice_total NUMERIC;
BEGIN
  -- Calculate the sum of all invoice items
  SELECT COALESCE(SUM(amount), 0)
  INTO invoice_total
  FROM invoice_items
  WHERE invoice_id = NEW.invoice_id;
  
  -- Update the invoice amount
  UPDATE invoices
  SET 
    amount = invoice_total,
    total_amount = invoice_total + tax_amount - discount_amount,
    updated_at = NOW()
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update invoice totals when items change
CREATE TRIGGER after_invoice_item_change
  AFTER INSERT OR UPDATE OR DELETE ON invoice_items
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_totals();

-- Create function to handle payment status updates
CREATE OR REPLACE FUNCTION update_invoice_payment_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If payment is completed, update the invoice status to paid
  IF NEW.status = 'completed' THEN
    UPDATE invoices
    SET 
      status = 'paid',
      paid_date = NEW.transaction_date,
      updated_at = NOW()
    WHERE id = NEW.invoice_id AND status != 'paid';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update invoice status when payment is completed
CREATE TRIGGER after_payment_transaction_update
  AFTER INSERT OR UPDATE ON payment_transactions
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_invoice_payment_status();

-- Create function to handle refund status updates (FIXED - removed updated_at reference)
CREATE OR REPLACE FUNCTION update_payment_refund_status()
RETURNS TRIGGER AS $$
BEGIN
  -- If refund is completed, update the payment transaction status to refunded
  IF NEW.status = 'completed' THEN
    UPDATE payment_transactions
    SET status = 'refunded'
    WHERE id = NEW.payment_transaction_id AND status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update payment status when refund is completed
CREATE TRIGGER after_refund_update
  AFTER INSERT OR UPDATE ON refunds
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION update_payment_refund_status();

-- Create function to ensure only one default payment method per customer
CREATE OR REPLACE FUNCTION ensure_single_default_payment_method()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is being set as default, unset any other default for this customer
  IF NEW.is_default THEN
    UPDATE payment_methods
    SET is_default = FALSE
    WHERE customer_id = NEW.customer_id
    AND id != NEW.id
    AND is_default = TRUE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one default payment method per customer
CREATE TRIGGER before_payment_method_update
  BEFORE INSERT OR UPDATE ON payment_methods
  FOR EACH ROW
  WHEN (NEW.is_default = TRUE)
  EXECUTE FUNCTION ensure_single_default_payment_method();

-- Create function to automatically generate invoices for subscriptions
CREATE OR REPLACE FUNCTION generate_subscription_invoice()
RETURNS TRIGGER AS $$
DECLARE
  v_customer_id uuid;
  v_app_id uuid;
  v_plan_id uuid;
  v_plan_name text;
  v_plan_price numeric;
  v_invoice_id uuid;
  v_billing_period_start date;
  v_billing_period_end date;
BEGIN
  -- Only generate invoice for active subscriptions
  IF NEW.status = 'active' THEN
    -- Set variables
    v_customer_id := NEW.customer_id;
    v_app_id := NEW.app_id;
    v_plan_id := NEW.plan_id;
    v_plan_price := NEW.price;
    
    -- Get plan name
    SELECT name INTO v_plan_name
    FROM subscription_plans
    WHERE id = v_plan_id;
    
    -- Set billing period
    v_billing_period_start := NEW.start_date;
    IF NEW.billing = 'monthly' THEN
      v_billing_period_end := v_billing_period_start + INTERVAL '1 month' - INTERVAL '1 day';
    ELSE
      v_billing_period_end := v_billing_period_start + INTERVAL '1 year' - INTERVAL '1 day';
    END IF;
    
    -- Create invoice
    INSERT INTO invoices (
      customer_id,
      subscription_id,
      amount,
      total_amount,
      status,
      due_date,
      issue_date,
      invoice_type,
      billing_period_start,
      billing_period_end
    ) VALUES (
      v_customer_id,
      NEW.id,
      v_plan_price,
      v_plan_price,
      'draft',
      CURRENT_DATE + INTERVAL '15 days',
      CURRENT_DATE,
      'subscription',
      v_billing_period_start,
      v_billing_period_end
    ) RETURNING id INTO v_invoice_id;
    
    -- Create invoice item
    INSERT INTO invoice_items (
      invoice_id,
      description,
      quantity,
      unit_price,
      amount,
      app_id
    ) VALUES (
      v_invoice_id,
      v_plan_name || ' Subscription',
      1,
      v_plan_price,
      v_plan_price,
      v_app_id
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically generate invoices for new subscriptions
CREATE TRIGGER after_subscription_insert
  AFTER INSERT ON customer_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION generate_subscription_invoice();

-- Insert sample data for testing
INSERT INTO payment_methods (id, customer_id, method_type, is_default, details, status)
VALUES
  ('aa0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'card', true, 
   '{"last4": "4242", "brand": "visa", "exp_month": 12, "exp_year": 2025}', 'active'),
  ('aa0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440002', 'paypal', true, 
   '{"email": "sarah.j@innovate.io"}', 'active'),
  ('aa0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440003', 'bank_transfer', true, 
   '{"bank_name": "Chase", "account_last4": "9876"}', 'active');

-- Insert sample invoices
INSERT INTO invoices (
  id, customer_id, subscription_id, invoice_number, amount, tax_amount, discount_amount, 
  total_amount, status, due_date, issue_date, paid_date, invoice_type, 
  billing_period_start, billing_period_end
)
VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 
   '880e8400-e29b-41d4-a716-446655440001', 'INV-202307-0001', 79, 7.9, 0, 86.9, 'paid', 
   '2023-07-15', '2023-07-01', '2023-07-05', 'subscription', '2023-07-01', '2023-07-31'),
   
  ('bb0e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 
   '880e8400-e29b-41d4-a716-446655440002', 'INV-202307-0002', 49, 4.9, 0, 53.9, 'paid', 
   '2023-07-15', '2023-07-01', '2023-07-05', 'subscription', '2023-07-01', '2023-07-31'),
   
  ('bb0e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440002', 
   '880e8400-e29b-41d4-a716-446655440003', 'INV-202307-0003', 29, 2.9, 0, 31.9, 'paid', 
   '2023-07-15', '2023-07-01', '2023-07-10', 'subscription', '2023-07-01', '2023-07-31'),
   
  ('bb0e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 
   '880e8400-e29b-41d4-a716-446655440001', 'INV-202308-0001', 79, 7.9, 0, 86.9, 'paid', 
   '2023-08-15', '2023-08-01', '2023-08-05', 'subscription', '2023-08-01', '2023-08-31'),
   
  ('bb0e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440001', 
   '880e8400-e29b-41d4-a716-446655440002', 'INV-202308-0002', 49, 4.9, 0, 53.9, 'paid', 
   '2023-08-15', '2023-08-01', '2023-08-05', 'subscription', '2023-08-01', '2023-08-31'),
   
  ('bb0e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440001', 
   '880e8400-e29b-41d4-a716-446655440001', 'INV-202309-0001', 79, 7.9, 0, 86.9, 'paid', 
   '2023-09-15', '2023-09-01', '2023-09-05', 'subscription', '2023-09-01', '2023-09-30'),
   
  ('bb0e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440001', 
   NULL, 'INV-202309-0002', 150, 15, 0, 165, 'paid', 
   '2023-09-15', '2023-09-01', '2023-09-05', 'one-time', NULL, NULL),
   
  ('bb0e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440001', 
   '880e8400-e29b-41d4-a716-446655440001', 'INV-202310-0001', 79, 7.9, 0, 86.9, 'paid', 
   '2023-10-15', '2023-10-01', '2023-10-05', 'subscription', '2023-10-01', '2023-10-31'),
   
  ('bb0e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440001', 
   '880e8400-e29b-41d4-a716-446655440001', 'INV-202311-0001', 79, 7.9, 0, 86.9, 'paid', 
   '2023-11-15', '2023-11-01', '2023-11-05', 'subscription', '2023-11-01', '2023-11-30'),
   
  ('bb0e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440001', 
   '880e8400-e29b-41d4-a716-446655440001', 'INV-202312-0001', 79, 7.9, 0, 86.9, 'sent', 
   '2023-12-15', '2023-12-01', NULL, 'subscription', '2023-12-01', '2023-12-31');

-- Insert sample invoice items
INSERT INTO invoice_items (
  invoice_id, description, quantity, unit_price, amount, app_id
)
VALUES
  ('bb0e8400-e29b-41d4-a716-446655440001', 'Professional Plan Subscription', 1, 79, 79, '550e8400-e29b-41d4-a716-446655440001'),
  ('bb0e8400-e29b-41d4-a716-446655440002', 'Business Storage Plan Subscription', 1, 49, 49, '550e8400-e29b-41d4-a716-446655440002'),
  ('bb0e8400-e29b-41d4-a716-446655440003', 'Starter Plan Subscription', 1, 29, 29, '550e8400-e29b-41d4-a716-446655440001'),
  ('bb0e8400-e29b-41d4-a716-446655440004', 'Professional Plan Subscription', 1, 79, 79, '550e8400-e29b-41d4-a716-446655440001'),
  ('bb0e8400-e29b-41d4-a716-446655440005', 'Business Storage Plan Subscription', 1, 49, 49, '550e8400-e29b-41d4-a716-446655440002'),
  ('bb0e8400-e29b-41d4-a716-446655440006', 'Professional Plan Subscription', 1, 79, 79, '550e8400-e29b-41d4-a716-446655440001'),
  ('bb0e8400-e29b-41d4-a716-446655440007', 'Custom Development Services', 3, 50, 150, '550e8400-e29b-41d4-a716-446655440001'),
  ('bb0e8400-e29b-41d4-a716-446655440008', 'Professional Plan Subscription', 1, 79, 79, '550e8400-e29b-41d4-a716-446655440001'),
  ('bb0e8400-e29b-41d4-a716-446655440009', 'Professional Plan Subscription', 1, 79, 79, '550e8400-e29b-41d4-a716-446655440001'),
  ('bb0e8400-e29b-41d4-a716-446655440010', 'Professional Plan Subscription', 1, 79, 79, '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample payment transactions
INSERT INTO payment_transactions (
  id, invoice_id, customer_id, payment_method_id, amount, status, 
  transaction_date, transaction_reference, gateway, gateway_response
)
VALUES
  ('cc0e8400-e29b-41d4-a716-446655440001', 'bb0e8400-e29b-41d4-a716-446655440001', 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   86.9, 'completed', '2023-07-05', 'txn_123456', 'stripe', 
   '{"id": "ch_123456", "status": "succeeded"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440002', 'bb0e8400-e29b-41d4-a716-446655440002', 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   53.9, 'completed', '2023-07-05', 'txn_123457', 'stripe', 
   '{"id": "ch_123457", "status": "succeeded"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440003', 'bb0e8400-e29b-41d4-a716-446655440003', 
   '770e8400-e29b-41d4-a716-446655440002', 'aa0e8400-e29b-41d4-a716-446655440002', 
   31.9, 'completed', '2023-07-10', 'txn_123458', 'paypal', 
   '{"id": "pay_123458", "status": "completed"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440004', 'bb0e8400-e29b-41d4-a716-446655440004', 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   86.9, 'completed', '2023-08-05', 'txn_123459', 'stripe', 
   '{"id": "ch_123459", "status": "succeeded"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440005', 'bb0e8400-e29b-41d4-a716-446655440005', 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   53.9, 'completed', '2023-08-05', 'txn_123460', 'stripe', 
   '{"id": "ch_123460", "status": "succeeded"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440006', 'bb0e8400-e29b-41d4-a716-446655440006', 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   86.9, 'completed', '2023-09-05', 'txn_123461', 'stripe', 
   '{"id": "ch_123461", "status": "succeeded"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440007', 'bb0e8400-e29b-41d4-a716-446655440007', 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   165, 'completed', '2023-09-05', 'txn_123462', 'stripe', 
   '{"id": "ch_123462", "status": "succeeded"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440008', 'bb0e8400-e29b-41d4-a716-446655440008', 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   86.9, 'completed', '2023-10-05', 'txn_123463', 'stripe', 
   '{"id": "ch_123463", "status": "succeeded"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440009', 'bb0e8400-e29b-41d4-a716-446655440009', 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   86.9, 'completed', '2023-11-05', 'txn_123464', 'stripe', 
   '{"id": "ch_123464", "status": "succeeded"}'),
   
  ('cc0e8400-e29b-41d4-a716-446655440010', NULL, 
   '770e8400-e29b-41d4-a716-446655440001', 'aa0e8400-e29b-41d4-a716-446655440001', 
   25, 'failed', '2023-11-15', 'txn_123465', 'stripe', 
   '{"id": "ch_123465", "status": "failed", "error": "Card declined"}');

-- Insert sample refund
INSERT INTO refunds (
  id, payment_transaction_id, invoice_id, amount, reason, status, refund_date, notes
)
VALUES
  ('dd0e8400-e29b-41d4-a716-446655440001', 'cc0e8400-e29b-41d4-a716-446655440007', 
   'bb0e8400-e29b-41d4-a716-446655440007', 50, 'Partial refund for unused services', 
   'completed', '2023-09-15', 'Customer requested partial refund');