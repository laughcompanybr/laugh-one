-- Ensure PostgREST exposes the parameterless workspace bootstrap RPC.
ALTER FUNCTION public.bootstrap_current_user_workspace() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.bootstrap_current_user_workspace() FROM anon, public;
GRANT EXECUTE ON FUNCTION public.bootstrap_current_user_workspace() TO authenticated;

-- Force PostgREST to refresh its function/schema cache after the migration.
NOTIFY pgrst, 'reload schema';
