/*
  # Initial SaaS Management Platform Schema

  1. New Tables
    - `apps`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `category` (text)
      - `status` (text)
      - `features` (text array)
      - `api_endpoint` (text)
      - `version` (text)
      - `subscribers` (integer)
      - `revenue` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `subscription_plans`
      - `id` (uuid, primary key)
      - `name` (text)
      - `app_id` (uuid, foreign key)
      - `price` (numeric)
      - `billing` (text)
      - `features` (text array)
      - `max_users` (integer)
      - `description` (text)
      - `is_popular` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `customers`
      - `id` (uuid, primary key)
      - `name` (text)
      - `email` (text, unique)
      - `company` (text)
      - `status` (text)
      - `total_spent` (numeric)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `customer_subscriptions`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `app_id` (uuid, foreign key)
      - `plan_id` (uuid, foreign key)
      - `status` (text)
      - `start_date` (date)
      - `end_date` (date)
      - `price` (numeric)
      - `billing` (text)
      - `enabled_features` (text array)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `payments`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `subscription_id` (uuid, foreign key)
      - `amount` (numeric)
      - `status` (text)
      - `payment_date` (timestamp)
      - `payment_method` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
*/

-- Create apps table
CREATE TABLE IF NOT EXISTS apps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  features text[] DEFAULT '{}',
  api_endpoint text,
  version text NOT NULL DEFAULT '1.0.0',
  subscribers integer DEFAULT 0,
  revenue numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE,
  price numeric NOT NULL DEFAULT 0,
  billing text NOT NULL DEFAULT 'monthly',
  features text[] DEFAULT '{}',
  max_users integer DEFAULT 1,
  description text,
  is_popular boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  company text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  total_spent numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create customer_subscriptions table
CREATE TABLE IF NOT EXISTS customer_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  app_id uuid REFERENCES apps(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES subscription_plans(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NOT NULL,
  price numeric NOT NULL DEFAULT 0,
  billing text NOT NULL DEFAULT 'monthly',
  enabled_features text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  payment_date timestamptz DEFAULT now(),
  payment_method text NOT NULL DEFAULT 'card',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE apps ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users
CREATE POLICY "Authenticated users can read apps"
  ON apps FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage apps"
  ON apps FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read subscription plans"
  ON subscription_plans FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage subscription plans"
  ON subscription_plans FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read customers"
  ON customers FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customers"
  ON customers FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read customer subscriptions"
  ON customer_subscriptions FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customer subscriptions"
  ON customer_subscriptions FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read payments"
  ON payments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage payments"
  ON payments FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_app_id ON subscription_plans(app_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_customer_id ON customer_subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_app_id ON customer_subscriptions(app_id);
CREATE INDEX IF NOT EXISTS idx_customer_subscriptions_plan_id ON customer_subscriptions(plan_id);
CREATE INDEX IF NOT EXISTS idx_payments_customer_id ON payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscription_id ON payments(subscription_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);