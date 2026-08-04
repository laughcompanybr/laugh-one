-- ============ CLIENTS ENRICHMENT ============
ALTER TABLE public.clients 
  ADD COLUMN IF NOT EXISTS zip TEXT,
  ADD COLUMN IF NOT EXISTS street TEXT,
  ADD COLUMN IF NOT EXISTS number TEXT,
  ADD COLUMN IF NOT EXISTS complement TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS reference TEXT;

-- ============ ORDERS ENRICHMENT ============
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS photo_path TEXT,
  ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1;

-- ============ STORAGE POLICIES ============
-- Client files bucket policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'client_files_auth' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "client_files_auth" ON storage.objects FOR ALL TO authenticated 
    USING (bucket_id = 'client-files') WITH CHECK (bucket_id = 'client-files');
  END IF;
END $$;

-- Order files bucket policies
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'order_files_auth' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "order_files_auth" ON storage.objects FOR ALL TO authenticated 
    USING (bucket_id = 'order-files') WITH CHECK (bucket_id = 'order-files');
  END IF;
END $$;
