-- Seed the onboarding templates used to personalize a new tenant.
INSERT INTO public.business_templates
  (business_type, display_name, description, enabled_modules)
VALUES
  ('Barbearia', 'Barbearia', 'Operação de serviços e relacionamento com clientes.', '["dashboard","clients","orders","finance","reports"]'::jsonb),
  ('Salão de beleza', 'Salão de beleza', 'Operação de serviços e relacionamento com clientes.', '["dashboard","clients","orders","finance","reports"]'::jsonb),
  ('Loja de roupas', 'Loja de roupas', 'Vendas, catálogo, estoque e financeiro.', '["dashboard","orders","products","clients","finance","reports"]'::jsonb),
  ('Joalheria', 'Joalheria', 'Vendas, catálogo, estoque e financeiro.', '["dashboard","orders","products","clients","finance","reports"]'::jsonb),
  ('Loja de eletrônicos', 'Loja de eletrônicos', 'Vendas, catálogo, estoque e financeiro.', '["dashboard","orders","products","clients","suppliers","finance","reports"]'::jsonb),
  ('Restaurante', 'Restaurante', 'Operação comercial, clientes e financeiro.', '["dashboard","orders","products","clients","finance","reports"]'::jsonb),
  ('Delivery', 'Delivery', 'Pedidos, clientes, produtos e financeiro.', '["dashboard","orders","products","clients","finance","reports"]'::jsonb),
  ('Clínica', 'Clínica', 'Gestão de clientes, operação e financeiro.', '["dashboard","clients","orders","finance","reports"]'::jsonb),
  ('Academia', 'Academia', 'Gestão de clientes, operação e financeiro.', '["dashboard","clients","orders","finance","reports"]'::jsonb),
  ('Agência', 'Agência', 'Gestão comercial, clientes e financeiro.', '["dashboard","clients","orders","finance","reports"]'::jsonb),
  ('Prestador de serviços', 'Prestador de serviços', 'Gestão comercial, clientes e financeiro.', '["dashboard","clients","orders","finance","reports"]'::jsonb),
  ('Outro', 'Negócio personalizado', 'Configuração inicial flexível para qualquer operação.', '["dashboard","orders","products","clients","finance","reports"]'::jsonb)
ON CONFLICT DO NOTHING;
