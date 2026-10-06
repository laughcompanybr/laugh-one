-- Schema base reconstruido a partir de src/integrations/supabase/types.ts
CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','staff','super_admin'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.order_status AS ENUM ('new','awaiting_deposit','paid','purchasing','in_transit','received','ready_delivery','delivered','cancelled','partial_payment','separating','shipped'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.payment_direction AS ENUM ('in','out'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.app_settings (
  created_at timestamptz NOT NULL DEFAULT now(),
  description text,
  key text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid,
  value jsonb
);
CREATE TABLE IF NOT EXISTS public.audit_log (
  actor uuid,
  changed_at timestamptz NOT NULL DEFAULT now(),
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  new_data jsonb,
  old_data jsonb,
  operation text NOT NULL,
  record_id text NOT NULL,
  table_name text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.audit_logs_v2 (
  action text NOT NULL,
  actor_id uuid,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  entity_id text NOT NULL,
  entity_type text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  new_data jsonb,
  old_data jsonb,
  request_id text
);
CREATE TABLE IF NOT EXISTS public.business_templates (
  business_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  custom_fields jsonb,
  dashboard_widgets jsonb,
  description text,
  display_name text NOT NULL,
  enabled_modules jsonb,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  terminology jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  workflows jsonb
);
CREATE TABLE IF NOT EXISTS public.client_attachments (
  client_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  filename text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind text,
  mime text,
  size numeric,
  storage_path text NOT NULL,
  uploaded_by uuid
);
CREATE TABLE IF NOT EXISTS public.clients (
  city text,
  company_id uuid,
  complement text,
  cpf text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  district text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram text,
  name text NOT NULL,
  notes text,
  number text,
  phone text,
  reference text,
  state text,
  street text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  whatsapp text,
  zip text
);
CREATE TABLE IF NOT EXISTS public.companies (
  accent_color text,
  address text,
  block_reason text,
  border_radius text,
  business_description text,
  business_type text,
  button_color text,
  card_color text,
  categories text,
  city text,
  commercial_email text,
  country text,
  created_at timestamptz NOT NULL DEFAULT now(),
  currency text,
  display_name text,
  employee_count numeric,
  error_color text,
  font_family text,
  functional_customizations jsonb,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_blocked boolean,
  language text,
  login_footer text,
  login_subtitle text,
  login_title text,
  login_welcome_message text,
  name text NOT NULL,
  navbar_color text,
  onboarding_status text,
  operating_segment text,
  phone text,
  primary_color text,
  primary_font text,
  secondary_color text,
  secondary_font text,
  services_offered text,
  sidebar_color text,
  slug text NOT NULL,
  social_media jsonb,
  state text,
  status text,
  success_color text,
  system_preferences jsonb,
  theme_mode text,
  timezone text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  warning_color text,
  website text,
  whatsapp text
);
CREATE TABLE IF NOT EXISTS public.company_activity_logs (
  action_type text NOT NULL,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  description text,
  field_changed text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module text NOT NULL,
  new_value text,
  old_value text,
  user_id uuid
);
CREATE TABLE IF NOT EXISTS public.company_modules (
  activated_at timestamptz,
  company_id uuid NOT NULL,
  custom_order numeric,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled boolean,
  module_id uuid NOT NULL,
  settings jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_onboarding_data (
  business_type text NOT NULL,
  city text,
  commercial_email text,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  employee_count text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  main_objective text,
  onboarding_completed boolean,
  phone text,
  responsible_name text,
  segment_data jsonb,
  state text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.company_roles (
  color text,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  description text,
  icon text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_active boolean,
  is_system boolean,
  name text NOT NULL,
  order numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.coupons (
  active boolean,
  code text NOT NULL,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  discount_fixed numeric,
  discount_percent numeric,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  max_uses numeric,
  uses_count numeric,
  valid_until text
);
CREATE TABLE IF NOT EXISTS public.employees (
  base_salary numeric,
  commission_percent numeric,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  email text,
  full_name text NOT NULL,
  hire_date timestamptz,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notes text,
  phone text,
  role text,
  status text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  whatsapp text
);
CREATE TABLE IF NOT EXISTS public.expenses (
  amount numeric NOT NULL,
  category text,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  description text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  incurred_at timestamptz,
  receipt_url text
);
CREATE TABLE IF NOT EXISTS public.financial_transactions (
  amount numeric,
  category text,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  description text NOT NULL,
  direction text NOT NULL,
  due_date timestamptz,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  method text,
  notes text,
  paid_at timestamptz,
  receipt_url text,
  status text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.goals (
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month text NOT NULL,
  notes text,
  orders_target numeric,
  profit_target numeric,
  sales_target numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  code_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  used_at timestamptz,
  user_id uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS public.module_permissions (
  can_edit boolean,
  can_view boolean,
  company_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid NOT NULL,
  role_id uuid
);
CREATE TABLE IF NOT EXISTS public.modules (
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  default_order numeric,
  dependencies text,
  description text,
  icon text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_core boolean,
  main_route text NOT NULL,
  name text NOT NULL,
  status text,
  version text
);
CREATE TABLE IF NOT EXISTS public.notification_queue (
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  last_error text,
  payload jsonb NOT NULL,
  recipient text NOT NULL,
  retry_count numeric,
  sent_at timestamptz,
  status text,
  type text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.order_attachments (
  created_at timestamptz NOT NULL DEFAULT now(),
  filename text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kind text,
  mime text,
  order_id uuid NOT NULL,
  size numeric,
  storage_path text NOT NULL,
  uploaded_by uuid
);
CREATE TABLE IF NOT EXISTS public.order_events (
  actor uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message text,
  meta jsonb,
  order_id uuid NOT NULL,
  type text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.order_items (
  created_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name_snapshot text NOT NULL,
  order_id uuid NOT NULL,
  product_id uuid,
  quantity numeric,
  sku_snapshot text,
  unit_cost_price numeric,
  unit_sale_price numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.orders (
  amount_received numeric,
  brand text,
  card_fee numeric,
  client_id uuid,
  commission numeric,
  company_id uuid,
  cost_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  employee_id uuid,
  expected_delivery text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  model text,
  notes text,
  order_number numeric,
  other_costs numeric,
  payment_method text,
  photo_path text,
  profit numeric,
  purchase_date timestamptz,
  quantity numeric,
  reference text,
  sale_price numeric,
  ship_city text,
  ship_complement text,
  ship_district text,
  ship_number text,
  ship_reference text,
  ship_state text,
  ship_street text,
  ship_zip text,
  shipping numeric,
  status public.order_status,
  supplier_id uuid,
  tracking_code text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.payments (
  amount numeric NOT NULL,
  card_fee numeric,
  card_fee_percent numeric,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  direction public.payment_direction NOT NULL,
  employee_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  installments numeric,
  method text,
  notes text,
  order_id uuid,
  paid_at timestamptz,
  receipt_url text
);
CREATE TABLE IF NOT EXISTS public.permissions (
  category text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  description text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id uuid,
  name text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.platform_logs (
  action text NOT NULL,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text,
  metadata jsonb,
  user_agent text,
  user_id uuid
);
CREATE TABLE IF NOT EXISTS public.product_movements (
  actor uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id uuid,
  product_id uuid NOT NULL,
  qty numeric NOT NULL,
  qty_after numeric NOT NULL,
  reason text,
  type text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.products (
  category text,
  company_id uuid,
  cost_price numeric,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  description text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url text,
  min_stock numeric,
  name text NOT NULL,
  notes text,
  sale_price numeric,
  sku text,
  status text,
  stock_qty numeric,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.profiles (
  avatar_url text,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  full_name text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  impersonated_company_id uuid,
  role_id uuid,
  theme text,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS public.role_permissions (
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  permission_id uuid NOT NULL,
  role_id uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  amount numeric NOT NULL,
  company_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  currency text,
  gateway text NOT NULL,
  gateway_transaction_id uuid,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  notes text,
  payment_date timestamptz,
  receipt_url text,
  status text NOT NULL
);
CREATE TABLE IF NOT EXISTS public.suppliers (
  avg_delivery_days numeric,
  company text,
  company_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  deleted_at timestamptz,
  email text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  instagram text,
  name text NOT NULL,
  notes text,
  phone text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  whatsapp text
);
CREATE TABLE IF NOT EXISTS public.system_errors (
  company_id uuid,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  error_message text,
  error_type text,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id text,
  stack_trace text,
  user_id uuid
);
CREATE TABLE IF NOT EXISTS public.system_telemetry (
  actor_id uuid,
  context jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  event_type text NOT NULL,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message text,
  request_id text
);
CREATE TABLE IF NOT EXISTS public.user_consent (
  consent_type text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  granted boolean,
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_address text,
  user_agent text,
  user_id uuid NOT NULL
);
CREATE TABLE IF NOT EXISTS public.user_roles (
  created_at timestamptz NOT NULL DEFAULT now(),
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role public.app_role NOT NULL,
  user_id uuid NOT NULL
);
-- Foreign keys
DO $$ BEGIN ALTER TABLE public.audit_logs_v2 ADD CONSTRAINT audit_logs_v2_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.client_attachments ADD CONSTRAINT client_attachments_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.clients ADD CONSTRAINT clients_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.company_activity_logs ADD CONSTRAINT company_activity_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.company_modules ADD CONSTRAINT company_modules_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.company_modules ADD CONSTRAINT company_modules_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.company_onboarding_data ADD CONSTRAINT company_onboarding_data_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.company_roles ADD CONSTRAINT company_roles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.coupons ADD CONSTRAINT coupons_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.employees ADD CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.expenses ADD CONSTRAINT expenses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.financial_transactions ADD CONSTRAINT financial_transactions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.goals ADD CONSTRAINT goals_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.module_permissions ADD CONSTRAINT module_permissions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.module_permissions ADD CONSTRAINT module_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.company_roles(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.notification_queue ADD CONSTRAINT notification_queue_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.order_attachments ADD CONSTRAINT order_attachments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.order_events ADD CONSTRAINT order_events_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.order_items ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.order_items ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.orders ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.orders ADD CONSTRAINT orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.orders ADD CONSTRAINT orders_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.orders ADD CONSTRAINT orders_supplier_id_fkey FOREIGN KEY (supplier_id) REFERENCES public.suppliers(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.payments ADD CONSTRAINT payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.payments ADD CONSTRAINT payments_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.payments ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.platform_logs ADD CONSTRAINT platform_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.product_movements ADD CONSTRAINT product_movements_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.product_movements ADD CONSTRAINT product_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.products ADD CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_impersonated_company_id_fkey FOREIGN KEY (impersonated_company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.company_roles(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_permission_id_fkey FOREIGN KEY (permission_id) REFERENCES public.permissions(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.role_permissions ADD CONSTRAINT role_permissions_role_id_fkey FOREIGN KEY (role_id) REFERENCES public.company_roles(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.subscription_payments ADD CONSTRAINT subscription_payments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.suppliers ADD CONSTRAINT suppliers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN ALTER TABLE public.system_errors ADD CONSTRAINT system_errors_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE SET NULL; EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Funcoes auxiliares
CREATE OR REPLACE FUNCTION public.tg_set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.get_user_company_id() RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin(_user_id uuid) RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(_user_id, 'admin') OR public.has_role(_user_id, 'staff') OR public.has_role(_user_id, 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.check_profiles_recursion() RETURNS boolean
LANGUAGE sql STABLE AS $$ SELECT false; $$;

CREATE OR REPLACE FUNCTION public.check_subscription_status() RETURNS trigger
LANGUAGE plpgsql AS $$ BEGIN
  IF NEW.status = 'active' AND NEW.expires_at <= now() THEN NEW.status := 'expired'; END IF;
  RETURN NEW;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'), NEW.raw_user_meta_data->>'avatar_url')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.log_audit_event(p_action text, p_company_id uuid, p_entity_id text, p_entity_type text, p_new_data jsonb, p_old_data jsonb, p_request_id text DEFAULT NULL) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; BEGIN
  INSERT INTO public.audit_logs_v2 (action, actor_id, company_id, entity_id, entity_type, new_data, old_data, request_id)
  VALUES (p_action, auth.uid(), p_company_id, p_entity_id, p_entity_type, p_new_data, p_old_data, p_request_id)
  RETURNING id INTO _id; RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.log_company_activity(p_action_type text, p_company_id uuid, p_description text, p_field_changed text, p_module text, p_new_value text, p_old_value text, p_user_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
  INSERT INTO public.company_activity_logs (company_id, user_id, module, action_type, description, field_changed, old_value, new_value)
  VALUES (p_company_id, p_user_id, p_module, p_action_type, p_description, p_field_changed, p_old_value, p_new_value);
END $$;

CREATE OR REPLACE FUNCTION public.log_system_error(p_company_id uuid, p_error_message text, p_error_type text, p_request_id text, p_user_id uuid, p_context jsonb DEFAULT NULL, p_stack_trace text DEFAULT NULL) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _id uuid; BEGIN
  INSERT INTO public.system_errors (company_id, user_id, error_type, error_message, stack_trace, context, request_id)
  VALUES (p_company_id, p_user_id, p_error_type, p_error_message, p_stack_trace, p_context, p_request_id)
  RETURNING id INTO _id; RETURN _id;
END $$;

CREATE OR REPLACE FUNCTION public.adjust_product_stock(_product_id uuid, _qty numeric, _reason text, _type text) RETURNS numeric
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _new numeric;
BEGIN
  UPDATE public.products
     SET stock_qty = COALESCE(stock_qty, 0) + _qty
   WHERE id = _product_id
  RETURNING stock_qty INTO _new;

  IF _new IS NULL THEN
    RAISE EXCEPTION 'Produto % não encontrado', _product_id;
  END IF;

  INSERT INTO public.product_movements (product_id, qty, qty_after, type, reason)
  VALUES (_product_id, _qty, _new, _type, _reason);

  RETURN _new;
END $$;

CREATE OR REPLACE FUNCTION public.apply_order_stock_out(_order_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
  PERFORM public.adjust_product_stock(oi.product_id, -oi.quantity, 'order ' || _order_id::text, 'out')
  FROM public.order_items oi WHERE oi.order_id = _order_id AND oi.product_id IS NOT NULL;
END $$;

CREATE OR REPLACE FUNCTION public.revert_order_stock(_order_id uuid) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
  PERFORM public.adjust_product_stock(oi.product_id, oi.quantity, 'revert order ' || _order_id::text, 'in')
  FROM public.order_items oi WHERE oi.order_id = _order_id AND oi.product_id IS NOT NULL;
END $$;

CREATE OR REPLACE FUNCTION public.get_module_access_indicators(_user_id uuid)
RETURNS TABLE(has_access boolean, module_slug text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT true, m.id::text FROM public.modules m;
$$;

-- RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY app_settings_read ON public.app_settings FOR SELECT TO authenticated USING (true);
CREATE POLICY app_settings_admin ON public.app_settings FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_log_auth ON public.audit_log FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.audit_logs_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_logs_v2_company ON public.audit_logs_v2 FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.business_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY business_templates_read ON public.business_templates FOR SELECT TO authenticated USING (true);
CREATE POLICY business_templates_admin ON public.business_templates FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.client_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY client_attachments_auth ON public.client_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY clients_company ON public.clients FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY companies_auth ON public.companies FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.company_activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_activity_logs_company ON public.company_activity_logs FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.company_modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_modules_company ON public.company_modules FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.company_onboarding_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_onboarding_data_company ON public.company_onboarding_data FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.company_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY company_roles_company ON public.company_roles FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY coupons_company ON public.coupons FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY employees_company ON public.employees FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY expenses_company ON public.expenses FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY financial_transactions_company ON public.financial_transactions FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY goals_company ON public.goals FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY mfa_backup_codes_own ON public.mfa_backup_codes FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY module_permissions_company ON public.module_permissions FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
CREATE POLICY modules_read ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY modules_admin ON public.modules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY notification_queue_company ON public.notification_queue FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.order_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_attachments_auth ON public.order_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_events_auth ON public.order_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY order_items_auth ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY orders_company ON public.orders FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY payments_company ON public.payments FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY permissions_read ON public.permissions FOR SELECT TO authenticated USING (true);
CREATE POLICY permissions_admin ON public.permissions FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.platform_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY platform_logs_company ON public.platform_logs FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.product_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY product_movements_auth ON public.product_movements FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY products_company ON public.products FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY role_permissions_company ON public.role_permissions FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY subscription_payments_company ON public.subscription_payments FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY suppliers_company ON public.suppliers FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;
CREATE POLICY system_errors_company ON public.system_errors FOR ALL TO authenticated
  USING (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'))
  WITH CHECK (company_id = public.get_user_company_id() OR public.has_role(auth.uid(),'super_admin'));
ALTER TABLE public.system_telemetry ENABLE ROW LEVEL SECURITY;
CREATE POLICY system_telemetry_auth ON public.system_telemetry FOR ALL TO authenticated USING (true) WITH CHECK (true);
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_consent_own ON public.user_consent FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY user_roles_select ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'super_admin'));
CREATE POLICY user_roles_admin ON public.user_roles FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'super_admin')) WITH CHECK (public.has_role(auth.uid(),'super_admin'));

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;


INSERT INTO public.modules (id, name, description, category, main_route, default_order, is_core, status) VALUES
  ('00000000-0000-4000-8000-000000000001','Dashboard','Visão geral','operação','/dashboard',1,true,'active'),
  ('00000000-0000-4000-8000-000000000002','Pedidos','Gestão de pedidos','operação','/pedidos',2,true,'active'),
  ('00000000-0000-4000-8000-000000000003','Produtos','Catálogo e estoque','operação','/produtos',3,true,'active'),
  ('00000000-0000-4000-8000-000000000004','Clientes','Gestão de clientes','gestão','/clientes',4,true,'active'),
  ('00000000-0000-4000-8000-000000000005','Fornecedores','Gestão de fornecedores','gestão','/fornecedores',5,true,'active'),
  ('00000000-0000-4000-8000-000000000006','Funcionários','Equipe','gestão','/funcionarios',6,true,'active'),
  ('00000000-0000-4000-8000-000000000007','Financeiro','Contas e fluxo de caixa','gestão','/financeiro',7,true,'active'),
  ('00000000-0000-4000-8000-000000000008','Relatórios','Relatórios e mensais','gestão','/relatorios',8,true,'active'),
  ('00000000-0000-4000-8000-000000000009','Automações','Regras automáticas','gestão','/automacoes',9,false,'active'),
  ('00000000-0000-4000-8000-000000000010','Configurações','Sistema','sistema','/configuracoes',10,true,'active')
ON CONFLICT (id) DO NOTHING;

