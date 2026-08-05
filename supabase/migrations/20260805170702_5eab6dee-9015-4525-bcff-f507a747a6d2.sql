-- 1. Novo tipo de período de cobrança
DO $$ BEGIN
  CREATE TYPE public.billing_period AS ENUM ('monthly','quarterly','semiannual','yearly');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Remover arquitetura antiga de múltiplos planos
DROP TABLE IF EXISTS public.subscriptions CASCADE;
DROP TABLE IF EXISTS public.plans CASCADE;

ALTER TABLE public.companies DROP COLUMN IF EXISTS plan_id;
ALTER TABLE public.companies DROP COLUMN IF EXISTS plan_tier;
ALTER TABLE public.coupons DROP COLUMN IF EXISTS plan_id;
ALTER TABLE public.subscription_payments DROP COLUMN IF EXISTS plan_id;
ALTER TABLE public.subscription_payments DROP COLUMN IF EXISTS subscription_id;

-- 3. Nova tabela de assinaturas: plano único + período
CREATE TABLE public.subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  plan_name text NOT NULL DEFAULT 'Plano Completo',
  billing_period public.billing_period NOT NULL DEFAULT 'monthly',
  start_date timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active',
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  gateway text,
  gateway_subscription_id text,
  canceled_at timestamptz,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT subscriptions_status_check CHECK (status IN ('active','expired','canceled','suspended'))
);

CREATE INDEX idx_subscriptions_company ON public.subscriptions(company_id);
CREATE UNIQUE INDEX idx_subscriptions_company_active ON public.subscriptions(company_id) WHERE status = 'active';

GRANT SELECT ON public.subscriptions TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios veem assinatura da propria empresa"
  ON public.subscriptions FOR SELECT TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "Super admin gerencia assinaturas"
  ON public.subscriptions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_subscriptions_updated
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

CREATE TRIGGER on_subscription_status_change
  AFTER INSERT OR UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.check_subscription_status();

-- Recriar vínculo dos pagamentos com a nova tabela
ALTER TABLE public.subscription_payments
  ADD COLUMN subscription_id uuid REFERENCES public.subscriptions(id) ON DELETE SET NULL;

-- 4. Tabela de preços por período (mesmo plano, durações diferentes)
CREATE TABLE public.subscription_pricing (
  period public.billing_period NOT NULL PRIMARY KEY,
  label text NOT NULL,
  months integer NOT NULL,
  days integer NOT NULL,
  price numeric NOT NULL,
  savings_percent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.subscription_pricing TO anon;
GRANT SELECT ON public.subscription_pricing TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.subscription_pricing TO authenticated;
GRANT ALL ON public.subscription_pricing TO service_role;

ALTER TABLE public.subscription_pricing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Precos sao publicos"
  ON public.subscription_pricing FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Super admin gerencia precos"
  ON public.subscription_pricing FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE TRIGGER trg_subscription_pricing_updated
  BEFORE UPDATE ON public.subscription_pricing
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

INSERT INTO public.subscription_pricing (period, label, months, days, price, savings_percent) VALUES
  ('monthly',    'Mensal',     1,  30,   99.90,  0),
  ('quarterly',  'Trimestral', 3,  90,  269.70, 10),
  ('semiannual', 'Semestral',  6, 180,  479.40, 20),
  ('yearly',     'Anual',     12, 365,  839.00, 30);

-- 5. Controle de acesso: apenas "possui assinatura ativa?"
CREATE OR REPLACE FUNCTION public.has_active_subscription(_company_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions s
    WHERE s.company_id = _company_id
      AND s.status = 'active'
      AND s.expires_at > now()
  );
$$;

CREATE OR REPLACE FUNCTION public.current_user_has_active_subscription()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin'::app_role)
      OR public.has_active_subscription(public.get_user_company_id());
$$;

-- 6. Expiração automática por data
CREATE OR REPLACE FUNCTION public.expire_due_subscriptions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE affected integer;
BEGIN
  UPDATE public.subscriptions
     SET status = 'expired'
   WHERE status = 'active' AND expires_at <= now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;