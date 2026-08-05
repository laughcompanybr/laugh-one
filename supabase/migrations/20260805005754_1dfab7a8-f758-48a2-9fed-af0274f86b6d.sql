-- 1. Final alignment of plans and subscriptions structure
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly',
ADD COLUMN IF NOT EXISTS price numeric(10,2),
ADD COLUMN IF NOT EXISTS features jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS active boolean DEFAULT true;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS next_payment timestamptz,
ADD COLUMN IF NOT EXISTS billing_cycle text DEFAULT 'monthly';

-- 2. Update next_payment from renewal_date for existing records (if any)
UPDATE public.subscriptions SET next_payment = renewal_date WHERE next_payment IS NULL;

-- 3. Create a view that represents the denormalized plan structure if needed for future checkout
-- This allows the UI to stay as is (normalized) while providing the flat structure for integration
CREATE OR REPLACE VIEW public.vw_available_plans AS
SELECT 
    id, 
    name, 
    'monthly' as billing_cycle, 
    price_monthly as price, 
    feature_list as features, 
    status = 'active' as active
FROM public.plans
UNION ALL
SELECT 
    id, 
    name, 
    'yearly' as billing_cycle, 
    price_yearly as price, 
    feature_list as features, 
    status = 'active' as active
FROM public.plans;

GRANT SELECT ON public.vw_available_plans TO authenticated;
