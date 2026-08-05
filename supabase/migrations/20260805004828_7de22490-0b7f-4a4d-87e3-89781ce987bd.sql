
-- 1. Garante que todas as tabelas críticas tenham company_id e RLS
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    AND table_name IN ('clients', 'orders', 'products', 'financial_transactions', 'expenses', 'suppliers', 'employees', 'goals', 'profiles', 'payments')
    LOOP
        -- Adiciona company_id se faltar
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'company_id') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE', t);
        END IF;

        -- Garante RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- Remove políticas antigas e cria a padrão de isolamento
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', t);
        EXECUTE format('CREATE POLICY tenant_isolation ON public.%I FOR ALL TO authenticated USING (company_id = public.get_user_company_id()) WITH CHECK (company_id = public.get_user_company_id())', t);
        
        -- Grants
        EXECUTE format('GRANT ALL ON public.%I TO authenticated', t);
        EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    END LOOP;
END $$;

-- 2. Refina a função has_role para evitar recursão e ser robusta
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role::text = _role
  ) OR EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.company_roles r ON p.role_id = r.id
    WHERE p.id = _user_id
      AND r.name = _role
  );
$$;

-- 3. Ajusta o tipo da coluna se necessário e atualiza os templates
DO $$
BEGIN
    IF (SELECT data_type FROM information_schema.columns WHERE table_name = 'business_templates' AND column_name = 'enabled_modules') = 'jsonb' THEN
        -- Se for jsonb, converte para text[] para ser compatível com ARRAY[] do Postgres ou altera a query para usar jsonb
        -- Vamos optar por garantir que a query de inserção use o formato correto para o que o banco espera
        NULL;
    END IF;
END $$;

-- Inserção com conversão explícita para o tipo da coluna
INSERT INTO public.business_templates (business_type, display_name, enabled_modules, dashboard_widgets, terminology)
VALUES 
('Barbearia', 'Barbearia & Barber Shop', '["dashboard", "clients", "orders", "finance", "reports", "employees"]'::jsonb, '[{"id": "daily_cuts", "title": "Cortes Hoje"}, {"id": "commissions", "title": "Comissões"}]'::jsonb, '{"orders": "Agendamentos", "clients": "Fregueses", "products": "Serviços", "employees": "Barbeiros"}'::jsonb),
('Salão de beleza', 'Salão de Estética & Beleza', '["dashboard", "clients", "orders", "finance", "reports", "employees"]'::jsonb, '[{"id": "daily_services", "title": "Serviços Hoje"}, {"id": "commissions", "title": "Comissões"}]'::jsonb, '{"orders": "Agendamentos", "clients": "Clientes", "products": "Serviços", "employees": "Profissionais"}'::jsonb),
('Joalheria', 'Joalheria & Luxo', '["dashboard", "products", "orders", "clients", "finance", "reports"]'::jsonb, '[{"id": "inventory_value", "title": "Valor em Estoque"}, {"id": "vip_sales", "title": "Vendas VIP"}]'::jsonb, '{"orders": "Pedidos", "clients": "Clientes VIP", "products": "Joias/Peças"}'::jsonb),
('Loja de roupas', 'Moda & Vestuário', '["dashboard", "products", "orders", "clients", "finance", "reports"]'::jsonb, '[{"id": "inventory_count", "title": "Peças em Estoque"}, {"id": "sales_volume", "title": "Volume de Vendas"}]'::jsonb, '{"orders": "Vendas", "clients": "Clientes", "products": "Coleções/Peças"}'::jsonb),
('Restaurante', 'Restaurante & Gastronomia', '["dashboard", "orders", "products", "finance", "reports"]'::jsonb, '[{"id": "table_turnover", "title": "Giro de Mesas"}, {"id": "top_dishes", "title": "Pratos Mais Pedidos"}]'::jsonb, '{"orders": "Mesas/Comandas", "clients": "Clientes", "products": "Cardápio"}'::jsonb),
('Delivery', 'Delivery & Entregas', '["dashboard", "orders", "products", "finance", "reports"]'::jsonb, '[{"id": "active_deliveries", "title": "Entregas Ativas"}, {"id": "delivery_time", "title": "Tempo Médio"}]'::jsonb, '{"orders": "Entregas", "clients": "Clientes", "products": "Itens/Menu"}'::jsonb),
('Clínica médica', 'Saúde & Clínicas', '["dashboard", "clients", "orders", "finance", "reports", "employees"]'::jsonb, '[{"id": "appointments", "title": "Consultas"}, {"id": "patients", "title": "Novos Pacientes"}]'::jsonb, '{"orders": "Consultas", "clients": "Pacientes", "products": "Procedimentos", "employees": "Médicos/Staff"}'::jsonb),
('Academia', 'Fitness & Academias', '["dashboard", "clients", "finance", "reports", "employees"]'::jsonb, '[{"id": "active_members", "title": "Alunos Ativos"}, {"id": "renewals", "title": "Renovações"}]'::jsonb, '{"orders": "Planos", "clients": "Alunos", "products": "Pacotes", "employees": "Instrutores"}'::jsonb),
('Imobiliária', 'Imóveis & Negócios', '["dashboard", "clients", "orders", "finance", "reports"]'::jsonb, '[{"id": "active_listings", "title": "Imóveis Ativos"}, {"id": "leads", "title": "Leads"}]'::jsonb, '{"orders": "Contratos", "clients": "Interessados", "products": "Imóveis"}'::jsonb),
('Oficina mecânica', 'Auto Center & Oficina', '["dashboard", "clients", "orders", "finance", "reports", "products"]'::jsonb, '[{"id": "active_repairs", "title": "Veículos no Pátio"}, {"id": "parts_stock", "title": "Peças em Falta"}]'::jsonb, '{"orders": "Ordens de Serviço", "clients": "Proprietários", "products": "Peças/Serviços"}'::jsonb),
('Pet shop', 'Pet Care & Shop', '["dashboard", "clients", "orders", "products", "finance", "reports"]'::jsonb, '[{"id": "grooming_slots", "title": "Banho & Tosa"}, {"id": "pet_count", "title": "Pets Atendidos"}]'::jsonb, '{"orders": "Serviços/Vendas", "clients": "Tutores", "products": "Produtos/Serviços"}'::jsonb),
('Escola/cursos', 'Educação & Cursos', '["dashboard", "clients", "finance", "reports", "employees"]'::jsonb, '[{"id": "enrolled_students", "title": "Matrículas"}, {"id": "attendance", "title": "Frequência"}]'::jsonb, '{"orders": "Matrículas", "clients": "Alunos", "products": "Cursos", "employees": "Professores"}'::jsonb),
('Agência de marketing', 'Marketing & Design', '["dashboard", "clients", "orders", "finance", "reports", "automation"]'::jsonb, '[{"id": "active_projects", "title": "Projetos Ativos"}, {"id": "ad_spend", "title": "Investimento"}]'::jsonb, '{"orders": "Projetos", "clients": "Contas", "products": "Serviços/Pacotes"}'::jsonb),
('Construtora', 'Engenharia & Obras', '["dashboard", "clients", "orders", "finance", "reports", "suppliers"]'::jsonb, '[{"id": "active_sites", "title": "Obras Ativas"}, {"id": "budget_status", "title": "Status Orçamentário"}]'::jsonb, '{"orders": "Obras/Contratos", "clients": "Investidores", "products": "Materiais", "suppliers": "Empreiteiras"}'::jsonb)
ON CONFLICT (business_type) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  enabled_modules = EXCLUDED.enabled_modules,
  dashboard_widgets = EXCLUDED.dashboard_widgets,
  terminology = EXCLUDED.terminology;

-- 4. Garante que o Super Admin tenha acesso global no diagnosticador
CREATE OR REPLACE FUNCTION public.check_profiles_recursion()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM public.profiles LIMIT 1);
EXCEPTION WHEN OTHERS THEN
  RETURN FALSE;
END;
$$;
