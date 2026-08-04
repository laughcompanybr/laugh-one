-- Step 1: Create the companies table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    favicon_url TEXT,
    primary_color TEXT DEFAULT '#0a0a0a',
    secondary_color TEXT DEFAULT '#ffffff',
    accent_color TEXT DEFAULT '#d4af37',
    font_family TEXT DEFAULT 'Manrope',
    login_image_url TEXT,
    sidebar_image_url TEXT,
    theme_mode TEXT DEFAULT 'dark' CHECK (theme_mode IN ('light', 'dark', 'system')),
    language TEXT DEFAULT 'pt-BR',
    currency TEXT DEFAULT 'BRL',
    timezone TEXT DEFAULT 'UTC',
    plan_tier TEXT DEFAULT 'free',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'archived')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Step 2: Add company_id to core tables
DO $$ 
BEGIN 
    -- Profiles table update
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='company_id') THEN
        ALTER TABLE public.profiles ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE SET NULL;
    END IF;

    -- Update other business tables
    -- Clientes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='clients' AND column_name='company_id') THEN
        ALTER TABLE public.clients ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;

    -- Pedidos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='orders' AND column_name='company_id') THEN
        ALTER TABLE public.orders ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;

    -- Produtos
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='company_id') THEN
        ALTER TABLE public.products ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;

    -- Financeiro
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='financial_transactions' AND column_name='company_id') THEN
        ALTER TABLE public.financial_transactions ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;

    -- Despesas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='company_id') THEN
        ALTER TABLE public.expenses ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;

    -- Fornecedores
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='company_id') THEN
        ALTER TABLE public.suppliers ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;

    -- Funcionários
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='employees' AND column_name='company_id') THEN
        ALTER TABLE public.employees ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;

    -- Metas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='goals' AND column_name='company_id') THEN
        ALTER TABLE public.goals ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Step 3: Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;

-- Step 4: Enable RLS and create base policies for companies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can see their own company"
ON public.companies
FOR SELECT
TO authenticated
USING (id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

-- Step 5: Update RLS for business tables to filter by company_id
-- We assume current session user has a company_id in their profile

CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
    SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Re-enable RLS on all tables and add company_id filter policies
DO $$
DECLARE
    t TEXT;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    AND table_name IN ('clients', 'orders', 'products', 'financial_transactions', 'expenses', 'suppliers', 'employees', 'goals')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        EXECUTE format('DROP POLICY IF EXISTS "Company isolation" ON public.%I', t);
        EXECUTE format('CREATE POLICY "Company isolation" ON public.%I FOR ALL TO authenticated USING (company_id = public.get_user_company_id()) WITH CHECK (company_id = public.get_user_company_id())', t);
    END LOOP;
END $$;
