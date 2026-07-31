-- Add notes column to payments table for storing self-report payment method
ALTER TABLE payments ADD COLUMN IF NOT EXISTS notes text;
