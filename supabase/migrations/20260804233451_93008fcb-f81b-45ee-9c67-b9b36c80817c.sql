-- Ensure modules table exists and is populated
CREATE TABLE IF NOT EXISTS public.modules (
    id text PRIMARY KEY,
    name text NOT NULL,
    description text,
    icon text,
    category text NOT NULL,
    version text DEFAULT '1.0.0',
    status text DEFAULT 'active',
    dependencies text[] DEFAULT '{}'::text[],
    main_route text NOT NULL,
    default_order integer DEFAULT 0,
    is_core boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.modules TO authenticated;
GRANT ALL ON public.modules TO service_role;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.company_modules (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    module_id text REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
    is_enabled boolean DEFAULT true,
    custom_order integer,
    settings jsonb DEFAULT '{}'::jsonb,
    activated_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(company_id, module_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_modules TO authenticated;
GRANT ALL ON public.company_modules TO service_role;
ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;

INSERT INTO public.modules (id, name, description, icon, category, main_route, default_order, is_core)
VALUES 
('dashboard', 'Dashboard', 'Painel de controle com indicadores principais', 'LayoutDashboard', 'Operação', '/dashboard', 0, true),
('orders', 'Pedidos', 'Gestão de pedidos e vendas', 'Package', 'Operação', '/pedidos', 1, false),
('products', 'Produtos', 'Catálogo de produtos e controle de estoque', 'Boxes', 'Operação', '/produtos', 2, false),
('clients', 'Clientes', 'Gestão de relacionamento com clientes (CRM)', 'Users', 'Gestão', '/clientes', 3, false),
('suppliers', 'Fornecedores', 'Gestão de parceiros e fornecedores', 'Truck', 'Gestão', '/fornecedores', 4, false),
('employees', 'Funcionários', 'Gestão de equipe e comissões', 'UsersRound', 'Gestão', '/funcionarios', 5, false),
('finance', 'Financeiro', 'Fluxo de caixa, contas a pagar e receber', 'Wallet', 'Gestão', '/financeiro', 6, false),
('attachments', 'Anexos', 'Central de arquivos e documentos', 'Paperclip', 'Gestão', '/anexos', 7, false),
('reports', 'Relatórios', 'BI e análise de dados estratégica', 'FileBarChart', 'Gestão', '/relatorios', 8, false),
('settings', 'Configurações', 'Ajustes do sistema e preferências', 'Settings', 'Sistema', '/configuracoes', 9, true),
('automation', 'Automações', 'Central de automações no-code', 'Zap', 'Gestão', '/automacoes', 10, false)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    category = EXCLUDED.category, 
    is_core = EXCLUDED.is_core;

-- Auto-enable all modules for existing companies to restore the UI
INSERT INTO public.company_modules (company_id, module_id, is_enabled)
SELECT c.id, m.id, true
FROM public.companies c, public.modules m
ON CONFLICT (company_id, module_id) DO UPDATE SET is_enabled = true;

-- Ensure RLS policies exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'modules' AND policyname = 'Anyone authenticated can view modules') THEN
        CREATE POLICY "Anyone authenticated can view modules" ON public.modules FOR SELECT TO authenticated USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'company_modules' AND policyname = 'Users can manage their company modules') THEN
        CREATE POLICY "Users can manage their company modules" ON public.company_modules FOR ALL TO authenticated 
        USING (company_id = public.get_user_company_id())
        WITH CHECK (company_id = public.get_user_company_id());
    END IF;
END $$;