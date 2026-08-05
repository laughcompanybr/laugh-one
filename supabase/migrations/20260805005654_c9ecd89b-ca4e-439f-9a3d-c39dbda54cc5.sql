-- 1. Synchronize plans table structure with the new requirements
ALTER TABLE public.plans 
ADD COLUMN IF NOT EXISTS price_quarterly numeric(10,2),
ADD COLUMN IF NOT EXISTS price_semiannual numeric(10,2),
ADD COLUMN IF NOT EXISTS highlight_text text,
ADD COLUMN IF NOT EXISTS feature_list text[];

-- 2. Seed/Update the requested plans: Starter, Professional, Business
-- We use a more flexible insertion approach to ensure the specific 3 plans exist
DELETE FROM public.plans WHERE name IN ('Starter', 'Professional', 'Business', 'Starter Plan', 'Business Plan', 'Enterprise');

INSERT INTO public.plans (name, description, price_monthly, price_quarterly, price_semiannual, price_yearly, feature_list, highlight_text, max_users, modules)
VALUES 
(
    'Starter', 
    'Pequenos negócios iniciando sua organização.', 
    49.90, 134.70, 239.40, 419.00,
    ARRAY['Cadastro de clientes', 'Gestão básica', 'Dashboard inicial', 'Controle financeiro básico', 'Relatórios simples', 'Um segmento de negócio', 'Suporte padrão'],
    NULL,
    2,
    '["crm", "financeiro"]'
),
(
    'Professional', 
    'Empresas que precisam de mais controle e crescimento.', 
    99.90, 269.70, 479.40, 839.00,
    ARRAY['Tudo do Starter', 'Todos os módulos do segmento', 'Relatórios avançados', 'Controle completo financeiro', 'Gestão de pedidos', 'Agenda', 'Funcionários', 'Comissões', 'Relatórios mensais', 'Personalização da empresa', 'Mais usuários'],
    'Mais escolhido',
    10,
    '["crm", "financeiro", "vendas", "mensais"]'
),
(
    'Business', 
    'Empresas maiores e operações profissionais.', 
    199.90, 539.70, 959.40, 1679.00,
    ARRAY['Tudo do Professional', 'Usuários ilimitados', 'Múltiplos funcionários', 'Permissões avançadas', 'Gestão completa da equipe', 'Relatórios estratégicos', 'Mais personalizações', 'Suporte prioritário', 'Recursos exclusivos'],
    NULL,
    999,
    '["crm", "financeiro", "vendas", "mensais", "automacao", "rh"]'
);
