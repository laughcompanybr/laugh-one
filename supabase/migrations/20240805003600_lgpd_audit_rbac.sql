-- 1. LGPD: PII classification and consent log
CREATE TABLE IF NOT EXISTS public.user_consent (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    consent_type TEXT NOT NULL, -- 'cookies', 'marketing', 'terms'
    granted BOOLEAN DEFAULT FALSE,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT, INSERT ON public.user_consent TO authenticated;
GRANT ALL ON public.user_consent TO service_role;
ALTER TABLE public.user_consent ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own consent" ON public.user_consent
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- 2. Advanced Audit Logs with JSONB diffing and request_id
CREATE TABLE IF NOT EXISTS public.audit_logs_v2 (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- 'onboarding_complete', 'module_toggle', 'settings_update'
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    old_data JSONB,
    new_data JSONB,
    request_id TEXT, -- For tracing
    created_at TIMESTAMPTZ DEFAULT now()
);

GRANT SELECT ON public.audit_logs_v2 TO authenticated;
GRANT ALL ON public.audit_logs_v2 TO service_role;
ALTER TABLE public.audit_logs_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their company audit logs" ON public.audit_logs_v2
    FOR SELECT TO authenticated USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        OR public.has_role(auth.uid(), 'admin')
    );

-- 3. RBAC: Module-level permissions
CREATE TABLE IF NOT EXISTS public.module_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role_id UUID REFERENCES public.company_roles(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL,
    can_view BOOLEAN DEFAULT TRUE,
    can_edit BOOLEAN DEFAULT FALSE,
    UNIQUE(role_id, module_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.module_permissions TO authenticated;
GRANT ALL ON public.module_permissions TO service_role;
ALTER TABLE public.module_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admins can manage module permissions" ON public.module_permissions
    FOR ALL TO authenticated USING (
        company_id = (SELECT company_id FROM public.profiles WHERE id = auth.uid())
        AND public.has_role(auth.uid(), 'admin')
    );

-- 4. Notification Queue for Email/WhatsApp
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'email', 'whatsapp'
    recipient TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'sent', 'failed'
    retry_count INT DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    sent_at TIMESTAMPTZ
);

GRANT ALL ON public.notification_queue TO service_role;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- 5. Helper function for auditing
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_company_id UUID,
    p_action TEXT,
    p_entity_type TEXT,
    p_entity_id UUID,
    p_old_data JSONB,
    p_new_data JSONB,
    p_request_id TEXT DEFAULT NULL
) RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO public.audit_logs_v2 (company_id, actor_id, action, entity_type, entity_id, old_data, new_data, request_id)
    VALUES (p_company_id, auth.uid(), p_action, p_entity_type, p_entity_id, p_old_data, p_new_data, p_request_id)
    RETURNING id INTO v_log_id;
    RETURN v_log_id;
END;
$$;
