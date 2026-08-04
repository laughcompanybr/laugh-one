-- ============ EXTEND ORDER_STATUS ENUM ============
-- Postgres doesn't allow ALTER TYPE ADD VALUE in transaction easily with IF NOT EXISTS
-- but we can use a DO block to safely add missing values.
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'order_status' AND e.enumlabel = 'partial_payment') THEN
    ALTER TYPE public.order_status ADD VALUE 'partial_payment';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'order_status' AND e.enumlabel = 'separating') THEN
    ALTER TYPE public.order_status ADD VALUE 'separating';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid WHERE t.typname = 'order_status' AND e.enumlabel = 'shipped') THEN
    ALTER TYPE public.order_status ADD VALUE 'shipped';
  END IF;
END $$;

-- ============ PAYMENTS ENRICHMENT ============
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS installments INTEGER,
  ADD COLUMN IF NOT EXISTS card_fee NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS card_fee_percent NUMERIC(5,2);
