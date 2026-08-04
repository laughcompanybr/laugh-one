-- ============ ORDERS ENRICHMENT (SHIPPING & COSTS) ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS card_fee NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS other_costs NUMERIC(12,2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ship_zip TEXT,
  ADD COLUMN IF NOT EXISTS ship_street TEXT,
  ADD COLUMN IF NOT EXISTS ship_number TEXT,
  ADD COLUMN IF NOT EXISTS ship_complement TEXT,
  ADD COLUMN IF NOT EXISTS ship_district TEXT,
  ADD COLUMN IF NOT EXISTS ship_city TEXT,
  ADD COLUMN IF NOT EXISTS ship_state TEXT,
  ADD COLUMN IF NOT EXISTS ship_reference TEXT;

-- ============ EXPENSES ENRICHMENT (RECEIPT) ============
ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- ============ STORAGE POLICIES (FINANCE RECEIPTS) ============
-- Ensure the bucket exists (UI or first upload usually handles this, but we define policy)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'finance_receipts_auth' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "finance_receipts_auth" ON storage.objects FOR ALL TO authenticated 
    USING (bucket_id = 'finance-receipts') WITH CHECK (bucket_id = 'finance-receipts');
  END IF;
END $$;
