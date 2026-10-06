-- Restore execution privileges required by tenant-isolation RLS policies.
-- These helpers are SECURITY DEFINER and are intentionally used by RLS to resolve
-- the current user's company/role without exposing arbitrary tenant data.
grant execute on function public.get_user_company_id() to authenticated;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
