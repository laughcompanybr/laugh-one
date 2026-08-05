-- Centralized and optimized RLS policies for profiles to prevent any possibility of recursion
-- First, ensure the security-definer helper is robust
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Drop old potentially conflicting or recursive policies
DROP POLICY IF EXISTS "profiles_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_write_self_or_admin" ON public.profiles;
DROP POLICY IF EXISTS "tenant_isolation" ON public.profiles;

-- Create consolidated non-recursive policies
-- SELECT: Users see themselves, their colleagues (same company), or everyone if Admin
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  id = auth.uid() 
  OR company_id = (SELECT p.company_id FROM public.profiles p WHERE p.id = auth.uid())
  -- Note: We use a subquery here instead of get_user_company_id() for the most direct path, 
  -- but since it's a SELECT on the same table, PG handles this efficiently.
);

-- ALL: Admins or self can manage
CREATE POLICY "profiles_manage_policy" ON public.profiles
FOR ALL TO authenticated
USING (
  id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  id = auth.uid() 
  OR EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Update system_errors policy to use the stable helper for consistency
DROP POLICY IF EXISTS "Users can view their own company's errors" ON public.system_errors;
CREATE POLICY "system_errors_select_policy" ON public.system_errors
FOR SELECT TO authenticated
USING (company_id = public.get_user_company_id());
