-- ============ GOALS ============
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL UNIQUE,
  sales_target NUMERIC(14,2) NOT NULL DEFAULT 0,
  orders_target INTEGER NOT NULL DEFAULT 0,
  profit_target NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.goals TO authenticated;
GRANT ALL ON public.goals TO service_role;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "goals_auth_all" ON public.goals FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ FINANCIAL TRANSACTIONS ============
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  direction public.payment_direction NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  description text NOT NULL,
  category text,
  amount numeric(12,2) NOT NULL DEFAULT 0,
  method text,
  due_date date,
  paid_at timestamptz,
  notes text,
  receipt_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.financial_transactions TO authenticated;
GRANT ALL ON public.financial_transactions TO service_role;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "financial_tx_auth_all" ON public.financial_transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ ORDERS ENRICHMENT (COMMISSION) ============
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS commission NUMERIC(12,2) DEFAULT 0;

-- ============ PAYMENTS ENRICHMENT (RECEIPT) ============
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS receipt_url TEXT;
