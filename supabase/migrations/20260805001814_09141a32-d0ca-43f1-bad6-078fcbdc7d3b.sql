-- 1. Redefine get_user_company_id to be robust and non-recursive
-- By using SECURITY DEFINER and setting search_path, we bypass RLS on the table inside the function.
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (SELECT company_id FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$;

-- 2. Consolidate profiles policies
-- Drop existing
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_policy" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_policy" ON public.profiles;
DROP POLICY IF EXISTS "Admins can select all rows" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- New Consolidated Policies
-- Anyone can see their own profile. 
-- Admins/Users can see profiles from their own company.
-- Super Admins can see everything.
CREATE POLICY "profiles_read_all" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() OR 
  company_id = public.get_user_company_id() OR 
  public.has_role(auth.uid(), 'admin')
);

-- Note: In multi-tenant, usually 'admin' role means company admin. 
-- 'super_admin' means platform admin.

CREATE POLICY "profiles_write_self_or_admin" ON public.profiles
FOR ALL TO authenticated
USING (
  id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
)
WITH CHECK (
  id = auth.uid() OR 
  public.has_role(auth.uid(), 'admin')
);

-- 3. Logging/Telemetry Table for RLS & System Errors
CREATE TABLE IF NOT EXISTS public.system_telemetry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  request_id text,
  event_type text NOT NULL, -- 'rls_check', 'auth_failure', 'system_error'
  actor_id uuid,
  context jsonb,
  message text
);

GRANT SELECT, INSERT ON public.system_telemetry TO authenticated;
GRANT ALL ON public.system_telemetry TO service_role;

-- 4. Automatic recursion check function
-- This function attempts to run a query and catches recursion errors (depth exceeded)
CREATE OR REPLACE FUNCTION public.check_profiles_recursion()
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER -- Run with current user's RLS
AS $$
DECLARE
  v_test uuid;
BEGIN
  -- Try to execute a select that would trigger RLS
  SELECT id INTO v_test FROM public.profiles LIMIT 1;
  RETURN true;
EXCEPTION WHEN OTHERS THEN
  RETURN false;
END;
$$;
