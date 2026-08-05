DROP POLICY IF EXISTS "client_files_auth" ON storage.objects;
DROP POLICY IF EXISTS "order_files_auth" ON storage.objects;
DROP POLICY IF EXISTS "finance_receipts_auth" ON storage.objects;
DROP POLICY IF EXISTS "product_images_auth" ON storage.objects;

ALTER FUNCTION public.check_subscription_status() SET search_path = public;
ALTER FUNCTION public.tg_set_updated_at() SET search_path = public;
ALTER FUNCTION public.create_default_company_roles() SET search_path = public;
ALTER FUNCTION public.check_profiles_recursion() SET search_path = public;
ALTER FUNCTION public.initialize_company_onboarding() SET search_path = public;
ALTER FUNCTION public.log_audit_event(uuid, text, text, uuid, jsonb, jsonb, text) SET search_path = public;