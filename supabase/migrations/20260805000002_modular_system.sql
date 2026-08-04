-- 1. Create Modules Registry
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

-- 2. Create Company Modules (Many-to-Many relationship)
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

-- 3. RLS Policies for Modules
CREATE POLICY "Anyone authenticated can view modules"
    ON public.modules FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can manage their company modules"
    ON public.company_modules FOR ALL TO authenticated 
    USING (company_id = public.get_user_company_id())
    WITH CHECK (company_id = public.get_user_company_id());

-- 4. Seed initial modules
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
('settings', 'Configurações', 'Ajustes do sistema e preferências', 'Settings', 'Sistema', '/configuracoes', 9, true)
ON CONFLICT (id) DO NOTHING;

-- 5. Trigger to auto-enable core modules for new companies
CREATE OR REPLACE FUNCTION public.enable_core_modules()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.company_modules (company_id, module_id)
    SELECT NEW.id, id FROM public.modules WHERE is_core = true
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_enable_core_modules ON public.companies;
CREATE TRIGGER trg_enable_core_modules
    AFTER INSERT ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.enable_core_modules();
