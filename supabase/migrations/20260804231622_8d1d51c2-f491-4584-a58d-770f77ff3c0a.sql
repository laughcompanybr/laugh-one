-- 2. Tabela de Planos
CREATE TABLE IF NOT EXISTS public.plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    max_users integer DEFAULT 5,
    max_clients integer DEFAULT 100,
    storage_gb integer DEFAULT 1,
    modules jsonb DEFAULT '[]'::jsonb,
    price_monthly numeric(10,2) DEFAULT 0,
    price_yearly numeric(10,2) DEFAULT 0,
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.plans TO authenticated;
GRANT ALL ON public.plans TO service_role;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- 3. Logs da Plataforma (Auditoria Global)
CREATE TABLE IF NOT EXISTS public.platform_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id),
    company_id uuid REFERENCES public.companies(id),
    action text NOT NULL,
    metadata jsonb DEFAULT '{}'::jsonb,
    ip_address text,
    user_agent text,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT ON public.platform_logs TO authenticated;
GRANT ALL ON public.platform_logs TO service_role;
ALTER TABLE public.platform_logs ENABLE ROW LEVEL SECURITY;

-- 4. Atualizar Empresas com Planos e Bloqueios
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS plan_id uuid REFERENCES public.plans(id),
ADD COLUMN IF NOT EXISTS is_blocked boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS block_reason text,
ADD COLUMN IF NOT EXISTS storage_used_bytes bigint DEFAULT 0;

-- 5. RLS Global para Super Admin (Agora que a role já deve estar commitada)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE POLICY "Admins can manage plans" ON public.plans
            TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
        CREATE POLICY "Super admins can view logs" ON public.platform_logs
            FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
        CREATE POLICY "Super admin global access" ON public.companies
            TO authenticated USING (public.has_role(auth.uid(), 'super_admin'));
    END IF;
END $$;

CREATE POLICY "Users can view active plans" ON public.plans
    FOR SELECT TO authenticated USING (active = true);
