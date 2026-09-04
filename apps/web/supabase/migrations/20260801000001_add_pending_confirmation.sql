-- Add pending_confirmation value to payment_status enum
-- NOTE: ALTER TYPE ... ADD VALUE cannot run inside a transaction block.
ALTER TYPE payment_status ADD VALUE IF NOT EXISTS 'pending_confirmation';
