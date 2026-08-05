-- Create missing policies for core system tables
DO $$ 
BEGIN
    -- profiles
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can see own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own profile' AND tablename = 'profiles') THEN
        CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
    END IF;

    -- companies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can see their company' AND tablename = 'companies') THEN
        CREATE POLICY "Users can see their company" ON public.companies FOR SELECT TO authenticated USING (
            id IN (SELECT company_id FROM public.profiles WHERE profiles.id = auth.uid())
        );
    END IF;

    -- Generic policies for company-scoped tables
    -- (This is a simplified approach, usually you'd iterate through tables with company_id)
END $$;

-- Fix functions search_path for security
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.has_role(uuid, public.app_role) SET search_path = public;

-- Ensure RLS is active everywhere
DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
    LOOP
        EXECUTE 'ALTER TABLE public.' || t || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;
