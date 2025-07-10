/*
  # Add logo_url column to apps table

  1. Changes
    - Add `logo_url` column to `apps` table
    - Column type: text (nullable)
    - Allows storing app logo URLs

  2. Notes
    - This column was missing from the original schema but is expected by the application
    - Making it nullable to allow apps without logos
*/

-- Add logo_url column to apps table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'apps' AND column_name = 'logo_url'
  ) THEN
    ALTER TABLE apps ADD COLUMN logo_url text;
  END IF;
END $$;