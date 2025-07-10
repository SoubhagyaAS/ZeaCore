/*
  # Enhance Apps and Plans Schema

  1. Apps Table Updates
    - Add `app_url` column for main app URL
    - Add `screenshots_urls` array column for storing screenshot URLs
    - Migrate existing api_endpoint data to app_url

  2. Subscription Plans Table Updates
    - Add `currency` column with validation
    - Add `icon_url` column for plan icons
    - Add `discount_percentage` column for plan discounts

  3. Constraints and Indexes
    - Add validation constraints for currency and discount percentage
    - Add indexes for better query performance

  4. Sample Data Updates
    - Update existing apps with sample URLs and screenshots
    - Update existing plans with currency and discount data
*/

-- Add new columns to apps table
DO $$
BEGIN
  -- Add app_url column (rename from api_endpoint conceptually)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'apps' AND column_name = 'app_url'
  ) THEN
    ALTER TABLE apps ADD COLUMN app_url text;
    -- Copy existing api_endpoint data to app_url
    UPDATE apps SET app_url = api_endpoint WHERE api_endpoint IS NOT NULL;
  END IF;

  -- Add screenshots_urls column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'screenshots_urls'
  ) THEN
    ALTER TABLE apps ADD COLUMN screenshots_urls text[] DEFAULT '{}';
  END IF;
END $$;

-- Add new columns to subscription_plans table
DO $$
BEGIN
  -- Add currency column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'currency'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN currency text NOT NULL DEFAULT 'USD';
  END IF;

  -- Add icon_url column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'icon_url'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN icon_url text;
  END IF;

  -- Add discount_percentage column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN discount_percentage numeric DEFAULT 0;
  END IF;
END $$;

-- Add constraints for data validation (check if they exist first)
DO $$
BEGIN
  -- Add currency validation constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_currency_valid' 
    AND table_name = 'subscription_plans'
  ) THEN
    ALTER TABLE subscription_plans 
    ADD CONSTRAINT check_currency_valid 
    CHECK (currency IN ('USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'SEK', 'NOK', 'DKK'));
  END IF;

  -- Add discount percentage validation constraint
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_discount_percentage_valid' 
    AND table_name = 'subscription_plans'
  ) THEN
    ALTER TABLE subscription_plans 
    ADD CONSTRAINT check_discount_percentage_valid 
    CHECK (discount_percentage >= 0 AND discount_percentage <= 100);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_apps_app_url ON apps(app_url);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_currency ON subscription_plans(currency);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_discount ON subscription_plans(discount_percentage);

-- Update sample data with new fields
UPDATE apps SET 
  app_url = CASE 
    WHEN name = 'ProjectFlow' THEN 'https://projectflow.com'
    WHEN name = 'DataVault' THEN 'https://datavault.com'
    WHEN name = 'AnalyticsPro' THEN 'https://analyticspro.com'
    WHEN name = 'ChatConnect' THEN 'https://chatconnect.com'
    ELSE app_url
  END,
  screenshots_urls = CASE 
    WHEN name = 'ProjectFlow' THEN ARRAY['https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg', 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg']
    WHEN name = 'DataVault' THEN ARRAY['https://images.pexels.com/photos/3184293/pexels-photo-3184293.jpeg']
    ELSE screenshots_urls
  END
WHERE name IN ('ProjectFlow', 'DataVault', 'AnalyticsPro', 'ChatConnect');

-- Update sample subscription plans with currency and sample icons
UPDATE subscription_plans SET 
  currency = 'USD',
  discount_percentage = CASE 
    WHEN name = 'Professional' THEN 10
    WHEN name = 'Enterprise' THEN 15
    ELSE 0
  END
WHERE id IN (
  '660e8400-e29b-41d4-a716-446655440001',
  '660e8400-e29b-41d4-a716-446655440002',
  '660e8400-e29b-41d4-a716-446655440003',
  '660e8400-e29b-41d4-a716-446655440004',
  '660e8400-e29b-41d4-a716-446655440005'
);