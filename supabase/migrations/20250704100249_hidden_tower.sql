/*
  # Customer Feature Access Tracking Table

  1. New Tables
    - `customer_feature_access`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key)
      - `subscription_id` (uuid, foreign key)
      - `feature_id` (uuid, foreign key)
      - `is_enabled` (boolean)
      - `enabled_date` (timestamp)
      - `disabled_date` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `customer_feature_access` table
    - Add policies for authenticated users to manage feature access

  3. Indexes
    - Add indexes for better query performance
*/

CREATE TABLE IF NOT EXISTS customer_feature_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
  feature_id uuid NOT NULL REFERENCES app_features(id) ON DELETE CASCADE,
  is_enabled boolean NOT NULL DEFAULT true,
  enabled_date timestamptz,
  disabled_date timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Ensure unique combination of customer, subscription, and feature
  UNIQUE(customer_id, subscription_id, feature_id)
);

-- Enable RLS
ALTER TABLE customer_feature_access ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read customer feature access"
  ON customer_feature_access
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage customer feature access"
  ON customer_feature_access
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_feature_access_customer_id ON customer_feature_access(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_feature_access_subscription_id ON customer_feature_access(subscription_id);
CREATE INDEX IF NOT EXISTS idx_customer_feature_access_feature_id ON customer_feature_access(feature_id);
CREATE INDEX IF NOT EXISTS idx_customer_feature_access_enabled ON customer_feature_access(is_enabled);

-- Function to automatically create feature access records when a subscription is created
CREATE OR REPLACE FUNCTION create_customer_feature_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert feature access records for all features of the subscribed app
  INSERT INTO customer_feature_access (customer_id, subscription_id, feature_id, is_enabled, enabled_date)
  SELECT 
    NEW.customer_id,
    NEW.id,
    af.id,
    af.is_default OR af.id = ANY(
      SELECT unnest(sp.features::uuid[]) 
      FROM subscription_plans sp 
      WHERE sp.id = NEW.plan_id
    ),
    CASE 
      WHEN af.is_default OR af.id = ANY(
        SELECT unnest(sp.features::uuid[]) 
        FROM subscription_plans sp 
        WHERE sp.id = NEW.plan_id
      ) THEN now()
      ELSE NULL
    END
  FROM app_features af
  JOIN subscription_plans sp ON af.app_id = sp.app_id
  WHERE sp.id = NEW.plan_id
  AND af.status = 'active';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create feature access when subscription is created
DROP TRIGGER IF EXISTS on_subscription_created ON customer_subscriptions;
CREATE TRIGGER on_subscription_created
  AFTER INSERT ON customer_subscriptions
  FOR EACH ROW EXECUTE FUNCTION create_customer_feature_access();