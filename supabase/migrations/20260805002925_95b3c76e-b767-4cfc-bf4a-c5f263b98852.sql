-- Add business_type and status to companies if not already correctly set
ALTER TABLE public.companies 
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_status TEXT DEFAULT 'pending';

-- Create company_onboarding_data for detailed tenant info
CREATE TABLE IF NOT EXISTS public.company_onboarding_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    business_type TEXT NOT NULL,
    responsible_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    commercial_email TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    employee_count TEXT NOT NULL,
    main_objective TEXT NOT NULL,
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(company_id)
);

-- RLS and Grants
ALTER TABLE public.company_onboarding_data ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE ON public.company_onboarding_data TO authenticated;
GRANT ALL ON public.company_onboarding_data TO service_role;

-- Policy for tenant isolation
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'company_onboarding_data' 
        AND policyname = 'Tenants can manage their own onboarding data'
    ) THEN
        CREATE POLICY "Tenants can manage their own onboarding data"
        ON public.company_onboarding_data
        FOR ALL
        TO authenticated
        USING (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()))
        WITH CHECK (company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));
    END IF;
END $$;

-- Re-grant on profiles just in case to ensure RLS helpers work
GRANT SELECT ON public.profiles TO authenticated;

-- Update the default branding in app_settings seed
UPDATE public.app_settings 
SET value = '{"name":"Laugh One","currency":"BRL","timezone":"America/Sao_Paulo"}'::jsonb,
    description = 'Configurações oficiais Laugh One'
WHERE key = 'company';
