-- Create business_templates table
CREATE TABLE IF NOT EXISTS public.business_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_type TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    enabled_modules JSONB DEFAULT '[]'::jsonb,
    dashboard_widgets JSONB DEFAULT '[]'::jsonb,
    custom_fields JSONB DEFAULT '[]'::jsonb,
    terminology JSONB DEFAULT '{}'::jsonb,
    workflows JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed initial templates
INSERT INTO public.business_templates (business_type, display_name, enabled_modules, dashboard_widgets, terminology)
VALUES 
(
  'Barbearia', 
  'Barbearia Profissional', 
  '["dashboard", "calendar", "clients", "services", "finance", "reports"]',
  '[{"id": "monthly_revenue", "title": "Faturamento Mensal"}, {"id": "cut_count", "title": "Cortes Realizados"}, {"id": "beard_count", "title": "Barbas Realizadas"}, {"id": "daily_schedule", "title": "Agenda do Dia"}, {"id": "top_professional", "title": "Melhor Profissional"}]',
  '{"client": "Cliente", "service": "Corte/Barba", "professional": "Barbeiro"}'
),
(
  'Salão de beleza', 
  'Salão & Estética', 
  '["dashboard", "calendar", "clients", "services", "inventory", "finance", "reports"]',
  '[{"id": "appointments", "title": "Agendamentos"}, {"id": "completed_services", "title": "Serviços Realizados"}, {"id": "active_professionals", "title": "Profissionais Ativos"}, {"id": "revenue", "title": "Faturamento"}]',
  '{"client": "Cliente", "service": "Procedimento", "professional": "Profissional"}'
),
(
  'Joalheria', 
  'Alta Joalheria', 
  '["dashboard", "products", "inventory", "orders", "clients", "finance", "reports"]',
  '[{"id": "sales", "title": "Vendas"}, {"id": "profit", "title": "Lucro"}, {"id": "stock_level", "title": "Estoque"}]',
  '{"product": "Peça", "category": "Material", "client": "VIP"}'
),
(
  'Restaurante', 
  'Gastronomia', 
  '["dashboard", "menu", "orders", "tables", "products", "finance"]',
  '[{"id": "daily_orders", "title": "Pedidos Hoje"}, {"id": "revenue", "title": "Faturamento"}, {"id": "average_ticket", "title": "Ticket Médio"}]',
  '{"product": "Prato", "orders": "Pedidos", "tables": "Mesas"}'
),
(
  'Clínica', 
  'Saúde & Bem-estar', 
  '["dashboard", "calendar", "patients", "procedures", "finance", "reports"]',
  '[{"id": "consultations", "title": "Consultas"}, {"id": "active_patients", "title": "Pacientes"}, {"id": "daily_schedule", "title": "Agenda"}]',
  '{"client": "Paciente", "service": "Consulta", "professional": "Médico"}'
)
ON CONFLICT (business_type) DO UPDATE SET
  enabled_modules = EXCLUDED.enabled_modules,
  dashboard_widgets = EXCLUDED.dashboard_widgets,
  terminology = EXCLUDED.terminology;

-- Grant permissions
GRANT SELECT ON public.business_templates TO authenticated;
GRANT ALL ON public.business_templates TO service_role;

-- Enable RLS
ALTER TABLE public.business_templates ENABLE ROW LEVEL SECURITY;

-- Policy
CREATE POLICY "Templates are viewable by all authenticated users"
ON public.business_templates FOR SELECT
TO authenticated
USING (true);
