/*
  # Add status column to subscription_plans table

  1. Changes
    - Add `status` column to `subscription_plans` table
    - Column type: text with default 'active'
    - Add constraint to ensure valid status values

  2. Notes
    - This allows plans to be marked as active/inactive
    - Existing plans will default to 'active' status
*/

-- Add status column to subscription_plans table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscription_plans' AND column_name = 'status'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN status text NOT NULL DEFAULT 'active';
  END IF;
END $$;

-- Add constraint to ensure valid status values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_plan_status_valid' 
    AND table_name = 'subscription_plans'
  ) THEN
    ALTER TABLE subscription_plans 
    ADD CONSTRAINT check_plan_status_valid 
    CHECK (status IN ('active', 'inactive'));
  END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_subscription_plans_status ON subscription_plans(status);