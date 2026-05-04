-- Add customer contact fields to invoices table since we don't have a separate customers table
ALTER TABLE invoices 
ADD COLUMN customer_phone TEXT,
ADD COLUMN customer_address TEXT,
ADD COLUMN customer_email TEXT;

-- Update existing invoices to have empty strings for new fields
UPDATE invoices 
SET customer_phone = '', customer_address = '', customer_email = ''
WHERE customer_phone IS NULL;
