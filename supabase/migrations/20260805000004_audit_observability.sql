-- 1. Create Audit Logs table (Global, but company-scoped)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    user_name text,
    user_role text,
    module_id text,
    action text NOT NULL,
    description text,
    entity_id text,
    entity_type text,
    old_value jsonb,
    new_value jsonb,
    ip_address text,
    user_agent text,
    status text DEFAULT 'success',
    execution_time_ms integer,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.audit_logs TO authenticated;
GRANT ALL ON public.audit_logs TO service_role;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create System Metrics table for Observability
CREATE TABLE IF NOT EXISTS public.system_metrics (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    metric_name text NOT NULL,
    metric_value numeric NOT NULL,
    unit text,
    tags jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.system_metrics TO authenticated;
GRANT ALL ON public.system_metrics TO service_role;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;

-- 3. Soft Delete Columns to important tables
DO $$ 
BEGIN 
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
    ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS delete_reason text;

    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
    ALTER TABLE public.products ADD COLUMN IF NOT EXISTS delete_reason text;

    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS deleted_by uuid REFERENCES auth.users(id);
    ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delete_reason text;
END $$;

-- 4. RLS Policies for Audit Logs
CREATE POLICY "Users can view their company audit logs"
    ON public.audit_logs FOR SELECT TO authenticated 
    USING (company_id = public.get_user_company_id());

CREATE POLICY "Super Admins can view all audit logs"
    ON public.audit_logs FOR SELECT TO authenticated 
    USING (public.has_role(auth.uid(), 'super_admin'));

-- 5. Audit Trigger Function (Generic)
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
    company_id uuid;
    user_id uuid;
    old_val jsonb := NULL;
    new_val jsonb := NULL;
BEGIN
    user_id := auth.uid();
    
    -- Try to get company_id from NEW or OLD record
    IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') THEN
        IF (NEW.company_id IS NOT NULL) THEN
            company_id := NEW.company_id;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.company_id IS NOT NULL) THEN
            company_id := OLD.company_id;
        END IF;
    END IF;

    IF (TG_OP = 'UPDATE') THEN
        old_val := to_jsonb(OLD);
        new_val := to_jsonb(NEW);
    ELSIF (TG_OP = 'INSERT') THEN
        new_val := to_jsonb(NEW);
    ELSIF (TG_OP = 'DELETE') THEN
        old_val := to_jsonb(OLD);
    END IF;

    INSERT INTO public.audit_logs (
        company_id, 
        user_id, 
        module_id, 
        action, 
        entity_type, 
        entity_id, 
        old_value, 
        new_value
    ) VALUES (
        company_id,
        user_id,
        TG_TABLE_NAME,
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id::text 
            ELSE NEW.id::text 
        END,
        old_val,
        new_val
    );

    IF (TG_OP = 'DELETE') THEN
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Attach audit triggers to main tables
DO $$
BEGIN
    -- Clients
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_clients') THEN
        CREATE TRIGGER trg_audit_clients AFTER INSERT OR UPDATE OR DELETE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
    END IF;
    -- Products
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_products') THEN
        CREATE TRIGGER trg_audit_products AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
    END IF;
    -- Orders
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_orders') THEN
        CREATE TRIGGER trg_audit_orders AFTER INSERT OR UPDATE OR DELETE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
    END IF;
END $$;
