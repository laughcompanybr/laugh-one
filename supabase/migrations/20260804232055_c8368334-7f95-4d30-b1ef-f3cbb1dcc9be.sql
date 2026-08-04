-- 1. Update Plans Table with detailed SaaS fields
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS trial_days integer DEFAULT 14,
ADD COLUMN IF NOT EXISTS max_products integer DEFAULT 50,
ADD COLUMN IF NOT EXISTS max_uploads integer DEFAULT 1000,
ADD COLUMN IF NOT EXISTS integrations jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS support_tier text DEFAULT 'standard',
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active';

-- 2. Create Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    plan_id uuid REFERENCES public.plans(id) NOT NULL,
    status text NOT NULL DEFAULT 'trial',
    start_date timestamptz DEFAULT now() NOT NULL,
    renewal_date timestamptz NOT NULL,
    expiry_date timestamptz,
    canceled_at timestamptz,
    is_trial boolean DEFAULT true,
    gateway text,
    gateway_subscription_id text,
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'BRL' NOT NULL,
    frequency text DEFAULT 'monthly' NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(company_id)
);

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 3. Create Subscription History / Payments Table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL,
    plan_id uuid REFERENCES public.plans(id),
    amount numeric(10,2) NOT NULL,
    currency text DEFAULT 'BRL',
    payment_date timestamptz DEFAULT now(),
    gateway text NOT NULL,
    gateway_transaction_id text,
    status text NOT NULL, -- paid, pending, failed, refunded
    receipt_url text,
    notes text,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.subscription_payments TO authenticated;
GRANT ALL ON public.subscription_payments TO service_role;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- 4. Create Coupons Table
CREATE TABLE IF NOT EXISTS public.coupons (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    code text UNIQUE NOT NULL,
    discount_percent numeric(5,2),
    discount_fixed numeric(10,2),
    valid_until timestamptz,
    max_uses integer,
    uses_count integer DEFAULT 0,
    plan_id uuid REFERENCES public.plans(id),
    company_id uuid REFERENCES public.companies(id),
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies for Subscriptions
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own company subscription') THEN
        CREATE POLICY "Users can view their own company subscription"
            ON public.subscriptions
            FOR SELECT
            TO authenticated
            USING (company_id = public.get_user_company_id());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own company payments') THEN
        CREATE POLICY "Users can view their own company payments"
            ON public.subscription_payments
            FOR SELECT
            TO authenticated
            USING (company_id = public.get_user_company_id());
    END IF;
END $$;

-- 6. Trigger to block company when trial/subscription expires
CREATE OR REPLACE FUNCTION public.check_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status IN ('expired', 'canceled', 'suspended') THEN
        UPDATE public.companies SET is_blocked = true, block_reason = 'Assinatura ' || NEW.status WHERE id = NEW.company_id;
    ELSIF NEW.status = 'active' OR NEW.status = 'trial' THEN
        UPDATE public.companies SET is_blocked = false, block_reason = NULL WHERE id = NEW.company_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_subscription_status_change ON public.subscriptions;
CREATE TRIGGER on_subscription_status_change
    AFTER INSERT OR UPDATE OF status ON public.subscriptions
    FOR EACH ROW EXECUTE FUNCTION public.check_subscription_status();

-- 7. Seed initial plans
INSERT INTO public.plans (name, description, price_monthly, price_yearly, max_users, max_clients, max_products, storage_gb, trial_days, modules)
VALUES 
('Starter', 'Ideal para pequenos negócios', 99.00, 990.00, 3, 50, 100, 2, 14, '["crm", "financeiro"]'),
('Business', 'Para empresas em crescimento', 199.00, 1990.00, 10, 500, 1000, 10, 14, '["crm", "financeiro", "estoque", "vendas"]'),
('Enterprise', 'Solução completa e ilimitada', 499.00, 4990.00, 50, 5000, 10000, 50, 14, '["crm", "financeiro", "estoque", "vendas", "rh", "automacao"]');
