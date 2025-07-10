/*
  # Add logo_url column to customers table

  1. Changes
    - Add `logo_url` column to `customers` table
    - Column allows NULL values for existing customers
    - Column stores text URLs for company logos

  2. Notes
    - This resolves the PGRST204 error where the application expects a logo_url column
    - Existing customers will have NULL logo_url values initially
    - New customers can have logo URLs added via the application
*/

-- Add logo_url column to customers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE customers ADD COLUMN logo_url text;
  END IF;
END $$;