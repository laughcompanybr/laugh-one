-- 1. Create system_errors table for detailed RLS/Policy error tracking
CREATE TABLE IF NOT EXISTS public.system_errors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    company_id UUID REFERENCES public.companies(id),
    request_id UUID,
    error_type TEXT,
    error_message TEXT,
    stack_trace TEXT,
    context JSONB DEFAULT '{}'::jsonb
);

GRANT SELECT, INSERT ON public.system_errors TO authenticated;
GRANT ALL ON public.system_errors TO service_role;

ALTER TABLE public.system_errors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own company's errors"
ON public.system_errors FOR SELECT
TO authenticated
USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can insert their own errors"
ON public.system_errors FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- 2. Function to log errors from server side with request correlation
CREATE OR REPLACE FUNCTION public.log_system_error(
    p_user_id UUID,
    p_company_id UUID,
    p_request_id UUID,
    p_error_type TEXT,
    p_error_message TEXT,
    p_stack_trace TEXT DEFAULT NULL,
    p_context JSONB DEFAULT '{}'::jsonb
) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.system_errors (user_id, company_id, request_id, error_type, error_message, stack_trace, context)
    VALUES (p_user_id, p_company_id, p_request_id, p_error_type, p_error_message, p_stack_trace, p_context)
    RETURNING id INTO v_id;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Enhance diagnostics: indicators for module access
CREATE OR REPLACE FUNCTION public.get_module_access_indicators(_user_id UUID)
RETURNS TABLE (module_slug TEXT, has_access BOOLEAN) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.slug,
        EXISTS (
            SELECT 1 
            FROM public.company_modules cm
            JOIN public.profiles p ON p.company_id = cm.company_id
            WHERE p.id = _user_id AND cm.module_id = m.id AND cm.enabled = true
        ) OR public.has_role(_user_id, 'admin') as has_access
    FROM public.modules m;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

