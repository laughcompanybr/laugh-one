-- 1. Create company_activity_logs table
CREATE TABLE public.company_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE', 'RESTORE'
    module TEXT NOT NULL, -- 'company', 'client', 'order', 'product', etc.
    field_changed TEXT,
    old_value TEXT,
    new_value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Grant permissions
GRANT SELECT ON public.company_activity_logs TO authenticated;
GRANT ALL ON public.company_activity_logs TO service_role;

-- Enable RLS
ALTER TABLE public.company_activity_logs ENABLE ROW LEVEL SECURITY;

-- Policy for isolation
CREATE POLICY "Users can only see their own company's activity logs"
ON public.company_activity_logs
FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

-- 2. Update companies table fields
ALTER TABLE public.companies 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS whatsapp TEXT,
ADD COLUMN IF NOT EXISTS commercial_email TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS country TEXT,
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS social_media JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS employee_count INTEGER,
ADD COLUMN IF NOT EXISTS services_offered TEXT[],
ADD COLUMN IF NOT EXISTS categories TEXT[],
ADD COLUMN IF NOT EXISTS business_description TEXT,
ADD COLUMN IF NOT EXISTS operating_segment TEXT,
ADD COLUMN IF NOT EXISTS system_preferences JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS functional_customizations JSONB DEFAULT '{}'::jsonb;

-- 3. Remove image/attachment columns from companies
ALTER TABLE public.companies 
DROP COLUMN IF EXISTS logo_url,
DROP COLUMN IF EXISTS favicon_url,
DROP COLUMN IF EXISTS login_image_url,
DROP COLUMN IF EXISTS sidebar_image_url,
DROP COLUMN IF EXISTS logo_reduced_url,
DROP COLUMN IF EXISTS mobile_icon_url,
DROP COLUMN IF EXISTS login_background_url,
DROP COLUMN IF EXISTS storage_used_bytes;

-- 4. Audit logic helper function
CREATE OR REPLACE FUNCTION public.log_company_activity(
    p_company_id UUID,
    p_user_id UUID,
    p_action_type TEXT,
    p_module TEXT,
    p_field_changed TEXT,
    p_old_value TEXT,
    p_new_value TEXT,
    p_description TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO public.company_activity_logs (
        company_id, user_id, action_type, module, field_changed, old_value, new_value, description
    ) VALUES (
        p_company_id, p_user_id, p_action_type, p_module, p_field_changed, p_old_value, p_new_value, p_description
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 5. Trigger for automatic auditing of company updates
CREATE OR REPLACE FUNCTION public.trg_audit_company_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Handle case where auth.uid() might be null (e.g. system operations)
    v_user_id := auth.uid();
    
    IF TG_OP = 'UPDATE' THEN
        IF OLD.name IS DISTINCT FROM NEW.name THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'name', OLD.name, NEW.name, 'Nome da empresa alterado'); END IF;
        IF OLD.phone IS DISTINCT FROM NEW.phone THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'phone', OLD.phone, NEW.phone, 'Telefone alterado'); END IF;
        IF OLD.whatsapp IS DISTINCT FROM NEW.whatsapp THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'whatsapp', OLD.whatsapp, NEW.whatsapp, 'WhatsApp alterado'); END IF;
        IF OLD.commercial_email IS DISTINCT FROM NEW.commercial_email THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'commercial_email', OLD.commercial_email, NEW.commercial_email, 'Email comercial alterado'); END IF;
        IF OLD.address IS DISTINCT FROM NEW.address THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'address', OLD.address, NEW.address, 'Endereço alterado'); END IF;
        IF OLD.city IS DISTINCT FROM NEW.city THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'city', OLD.city, NEW.city, 'Cidade alterada'); END IF;
        IF OLD.state IS DISTINCT FROM NEW.state THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'state', OLD.state, NEW.state, 'Estado alterado'); END IF;
        IF OLD.website IS DISTINCT FROM NEW.website THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'website', OLD.website, NEW.website, 'Site alterado'); END IF;
        IF OLD.business_description IS DISTINCT FROM NEW.business_description THEN PERFORM public.log_company_activity(NEW.id, v_user_id, 'UPDATE', 'company', 'business_description', OLD.business_description, NEW.business_description, 'Descrição alterada'); END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS audit_company_changes ON public.companies;
CREATE TRIGGER audit_company_changes
AFTER UPDATE ON public.companies
FOR EACH ROW EXECUTE FUNCTION public.trg_audit_company_changes();

-- 6. Add Audit Triggers for Clients, Products, Orders
CREATE OR REPLACE FUNCTION public.trg_generic_audit()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
    v_company_id UUID;
BEGIN
    v_user_id := auth.uid();
    v_company_id := COALESCE(NEW.company_id, OLD.company_id);
    
    IF TG_OP = 'UPDATE' THEN
        PERFORM public.log_company_activity(v_company_id, v_user_id, 'UPDATE', TG_TABLE_NAME, 'multiple', '...', '...', 'Registro atualizado em ' || TG_TABLE_NAME);
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM public.log_company_activity(v_company_id, v_user_id, 'INSERT', TG_TABLE_NAME, NULL, NULL, 'NEW', 'Novo registro em ' || TG_TABLE_NAME);
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM public.log_company_activity(v_company_id, v_user_id, 'DELETE', TG_TABLE_NAME, NULL, 'OLD', NULL, 'Registro removido em ' || TG_TABLE_NAME);
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Apply to Clients
DROP TRIGGER IF EXISTS audit_clients ON public.clients;
CREATE TRIGGER audit_clients AFTER INSERT OR UPDATE OR DELETE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.trg_generic_audit();

-- Apply to Products
DROP TRIGGER IF EXISTS audit_products ON public.products;
CREATE TRIGGER audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.trg_generic_audit();

-- Apply to Orders
DROP TRIGGER IF EXISTS audit_orders ON public.orders;
CREATE TRIGGER audit_orders AFTER INSERT OR UPDATE OR DELETE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.trg_generic_audit();
