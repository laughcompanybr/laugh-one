-- 1. Create missing tables and columns
CREATE TABLE IF NOT EXISTS public.business_templates (
    business_type TEXT PRIMARY KEY,
    display_name TEXT NOT NULL,
    enabled_modules JSONB NOT NULL,
    dashboard_widgets JSONB NOT NULL,
    terminology JSONB NOT NULL,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    workflows JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.business_templates TO authenticated;
GRANT ALL ON public.business_templates TO service_role;
ALTER TABLE public.business_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read for business templates" ON public.business_templates FOR SELECT TO authenticated USING (true);

-- 2. Seed Templates (Fixed types)
INSERT INTO public.business_templates (business_type, display_name, enabled_modules, dashboard_widgets, terminology)
VALUES 
(
  'Barbearia', 
  'Barbearia Profissional', 
  '["dashboard", "clients", "orders", "finance", "reports"]'::jsonb, 
  '[{"id": "daily_cuts", "title": "Cortes Hoje"}, {"id": "commissions", "title": "Comissões"}, {"id": "top_barbers", "title": "Melhores Barbeiros"}]'::jsonb,
  '{"orders": "Atendimentos", "clients": "Fregueses", "products": "Produtos/Serviços"}'::jsonb
),
(
  'Joalheria', 
  'Joalheria & Relojoaria', 
  '["dashboard", "products", "orders", "clients", "finance", "reports"]'::jsonb, 
  '[{"id": "inventory_value", "title": "Valor em Estoque"}, {"id": "quotes", "title": "Orçamentos Abertos"}, {"id": "vip_sales", "title": "Vendas VIP"}]'::jsonb,
  '{"orders": "Pedidos", "clients": "Clientes VIP", "products": "Joias/Peças"}'::jsonb
),
(
  'Restaurante', 
  'Restaurante & Gastronomia', 
  '["dashboard", "orders", "products", "finance", "reports"]'::jsonb, 
  '[{"id": "table_turnover", "title": "Giro de Mesas"}, {"id": "popular_dishes", "title": "Pratos Populares"}, {"id": "delivery_ratio", "title": "Proporção Delivery"}]'::jsonb,
  '{"orders": "Mesas/Comandas", "clients": "Clientes", "products": "Cardápio"}'::jsonb
)
ON CONFLICT (business_type) DO UPDATE SET 
  display_name = EXCLUDED.display_name,
  enabled_modules = EXCLUDED.enabled_modules,
  dashboard_widgets = EXCLUDED.dashboard_widgets,
  terminology = EXCLUDED.terminology;

-- 3. Ensure company_id exists on critical tables
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'orders' AND column_name = 'company_id') THEN
        ALTER TABLE public.orders ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'company_id') THEN
        ALTER TABLE public.payments ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'company_id') THEN
        ALTER TABLE public.expenses ADD COLUMN company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Enable RLS and Tenant Isolation
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
        
        -- Clean up existing tenant isolation policy to prevent duplicate errors
        EXECUTE format('DROP POLICY IF EXISTS tenant_isolation ON public.%I', t);
        
        -- Create isolation policy if company_id column exists
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = t AND column_name = 'company_id') THEN
            EXECUTE format('CREATE POLICY tenant_isolation ON public.%I FOR ALL TO authenticated USING (company_id = (SELECT company_id FROM profiles WHERE id = auth.uid()))', t);
        END IF;
    END LOOP;
END $$;