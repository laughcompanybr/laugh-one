-- 1. Ensure Companies Table has all White Label customization fields
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS logo_reduced_url text,
ADD COLUMN IF NOT EXISTS mobile_icon_url text,
ADD COLUMN IF NOT EXISTS success_color text DEFAULT '#10b981',
ADD COLUMN IF NOT EXISTS warning_color text DEFAULT '#f59e0b',
ADD COLUMN IF NOT EXISTS error_color text DEFAULT '#ef4444',
ADD COLUMN IF NOT EXISTS sidebar_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS navbar_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS button_color text DEFAULT '#1a1a1a',
ADD COLUMN IF NOT EXISTS card_color text DEFAULT '#ffffff',
ADD COLUMN IF NOT EXISTS primary_font text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS secondary_font text DEFAULT 'Inter',
ADD COLUMN IF NOT EXISTS login_background_url text,
ADD COLUMN IF NOT EXISTS login_welcome_message text,
ADD COLUMN IF NOT EXISTS login_title text,
ADD COLUMN IF NOT EXISTS login_subtitle text,
ADD COLUMN IF NOT EXISTS login_footer text,
ADD COLUMN IF NOT EXISTS border_radius text DEFAULT '0.5rem';

-- 2. Helper function to get current company ID (consistent across the app)
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid AS $$
    SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Re-apply RLS policies for Multi-Tenancy on all business tables
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    AND table_name IN ('clients', 'orders', 'products', 'financial_transactions', 'expenses', 'suppliers', 'employees', 'goals')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "tenant_isolation" ON public.%I', t);
        EXECUTE format('CREATE POLICY "tenant_isolation" ON public.%I FOR ALL TO authenticated USING (company_id = public.get_user_company_id()) WITH CHECK (company_id = public.get_user_company_id())', t);
    END LOOP;
END $$;
