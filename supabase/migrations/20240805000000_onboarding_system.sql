-- 1. Create company_onboarding_data table to store initial setup info
CREATE TABLE IF NOT EXISTS public.company_onboarding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    business_type TEXT NOT NULL,
    segment_data JSONB DEFAULT '{}'::jsonb,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    responsible_name TEXT,
    phone TEXT,
    commercial_email TEXT,
    city TEXT,
    state TEXT,
    employee_count TEXT,
    main_objective TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id)
);

-- 2. Add columns to companies if they don't exist for better multi-tenant config
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS business_type TEXT;
ALTER TABLE public.companies ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending';

-- 3. RBAC/Grants
GRANT ALL ON public.company_onboarding_data TO authenticated;
GRANT ALL ON public.company_onboarding_data TO service_role;

-- 4. RLS
ALTER TABLE public.company_onboarding_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own company onboarding"
    ON public.company_onboarding_data
    FOR ALL
    TO authenticated
    USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
    WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- 5. Helper Function to initialize onboarding for new companies
CREATE OR REPLACE FUNCTION public.initialize_company_onboarding()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.company_onboarding_data (company_id, business_type)
    VALUES (NEW.id, 'Pendente');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if trigger exists before creating
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_initialize_company_onboarding') THEN
        CREATE TRIGGER trg_initialize_company_onboarding
        AFTER INSERT ON public.companies
        FOR EACH ROW EXECUTE FUNCTION public.initialize_company_onboarding();
    END IF;
END $$;
