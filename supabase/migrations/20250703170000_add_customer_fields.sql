-- Add new fields to customers table
ALTER TABLE customers 
ADD COLUMN country VARCHAR(100),
ADD COLUMN state VARCHAR(100),
ADD COLUMN phone VARCHAR(20),
ADD COLUMN website VARCHAR(255),
ADD COLUMN notes TEXT;

-- Update existing customers with sample data
UPDATE customers SET 
  country = 'United States',
  state = 'California',
  phone = '+1-555-0123',
  website = 'https://example.com',
  notes = 'Sample customer data'
WHERE country IS NULL; 