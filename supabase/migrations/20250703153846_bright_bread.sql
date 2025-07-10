/*
  # Create app_features table for managing product features

  1. New Tables
    - `app_features`
      - `id` (uuid, primary key)
      - `name` (text, feature name)
      - `description` (text, feature description)
      - `app_id` (uuid, foreign key to apps)
      - `feature_type` (text, type of feature)
      - `base_price` (numeric, base price for the feature)
      - `status` (text, active/inactive)
      - `is_default` (boolean, whether included by default)
      - `metadata` (jsonb, additional configuration)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `app_features` table
    - Add policies for authenticated users to manage features

  3. Indexes
    - Add index on app_id for better query performance
    - Add index on status for filtering
*/

CREATE TABLE IF NOT EXISTS app_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  app_id uuid NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
  feature_type text NOT NULL DEFAULT 'basic',
  base_price numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'active',
  is_default boolean NOT NULL DEFAULT false,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE app_features ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read app features"
  ON app_features
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage app features"
  ON app_features
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_app_features_app_id ON app_features(app_id);
CREATE INDEX IF NOT EXISTS idx_app_features_status ON app_features(status);
CREATE INDEX IF NOT EXISTS idx_app_features_type ON app_features(feature_type);
CREATE INDEX IF NOT EXISTS idx_app_features_default ON app_features(is_default);

-- Add constraint to ensure valid feature types
ALTER TABLE app_features ADD CONSTRAINT check_feature_type 
  CHECK (feature_type IN ('basic', 'premium', 'addon', 'integration', 'api', 'storage', 'bandwidth', 'users'));

-- Add constraint to ensure valid status
ALTER TABLE app_features ADD CONSTRAINT check_feature_status 
  CHECK (status IN ('active', 'inactive'));

-- Add constraint to ensure non-negative pricing
ALTER TABLE app_features ADD CONSTRAINT check_base_price_non_negative 
  CHECK (base_price >= 0);