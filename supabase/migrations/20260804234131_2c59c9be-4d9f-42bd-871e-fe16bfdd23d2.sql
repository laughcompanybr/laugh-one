-- 1. Create Roles table (per company)
CREATE TABLE IF NOT EXISTS public.company_roles (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    name text NOT NULL,
    description text,
    color text DEFAULT '#6366f1',
    icon text DEFAULT 'Shield',
    "order" integer DEFAULT 0,
    is_active boolean DEFAULT true,
    is_system boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(company_id, name)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.company_roles TO authenticated;
GRANT ALL ON public.company_roles TO service_role;
ALTER TABLE public.company_roles ENABLE ROW LEVEL SECURITY;

-- 2. Create Permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id text PRIMARY KEY,
    name text NOT NULL,
    module_id text, -- Simplified for now as modules table might also be missing
    description text,
    category text NOT NULL,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.permissions TO authenticated;
GRANT ALL ON public.permissions TO service_role;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

-- 3. Create Role Permissions (Join table)
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    role_id uuid REFERENCES public.company_roles(id) ON DELETE CASCADE NOT NULL,
    permission_id text REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    created_at timestamptz DEFAULT now(),
    UNIQUE(role_id, permission_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.role_permissions TO authenticated;
GRANT ALL ON public.role_permissions TO service_role;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 4. Update profiles to link to company_roles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role_id uuid REFERENCES public.company_roles(id) ON DELETE SET NULL;

-- 5. Seed initial permissions
INSERT INTO public.permissions (id, name, module_id, category, description) VALUES
('clients.view', 'Visualizar Clientes', 'clients', 'Comercial', 'Permite ver a listagem e detalhes dos clientes'),
('clients.create', 'Criar Clientes', 'clients', 'Comercial', 'Permite cadastrar novos clientes'),
('clients.edit', 'Editar Clientes', 'clients', 'Comercial', 'Permite alterar dados de clientes existentes'),
('clients.delete', 'Excluir Clientes', 'clients', 'Comercial', 'Permite remover clientes do sistema'),
('orders.view', 'Visualizar Pedidos', 'orders', 'Operação', 'Permite ver a listagem de pedidos'),
('orders.create', 'Criar Pedidos', 'orders', 'Operação', 'Permite criar novos pedidos'),
('orders.edit', 'Editar Pedidos', 'orders', 'Operação', 'Permite editar pedidos'),
('finance.view', 'Visualizar Financeiro', 'finance', 'Financeiro', 'Permite ver fluxo de caixa e transações'),
('finance.approve', 'Aprovar Pagamentos', 'finance', 'Financeiro', 'Permite validar e aprovar pagamentos'),
('settings.manage', 'Gerenciar Configurações', 'settings', 'Sistema', 'Acesso total às configurações da empresa')
ON CONFLICT (id) DO NOTHING;

-- 6. Ensure default roles trigger exists
CREATE OR REPLACE FUNCTION public.create_default_company_roles()
RETURNS TRIGGER AS $$
DECLARE
    admin_role_id uuid;
BEGIN
    INSERT INTO public.company_roles (company_id, name, description, is_system)
    VALUES (NEW.id, 'Administrador', 'Acesso total ao sistema', true)
    RETURNING id INTO admin_role_id;

    INSERT INTO public.role_permissions (role_id, permission_id, company_id)
    SELECT admin_role_id, id, NEW.id FROM public.permissions;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_default_roles ON public.companies;
CREATE TRIGGER trg_create_default_roles
    AFTER INSERT ON public.companies
    FOR EACH ROW EXECUTE FUNCTION public.create_default_company_roles();
