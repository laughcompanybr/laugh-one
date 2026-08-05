-- Fix recursion: get_user_company_id must be a hardened security definer helper
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$;

-- PROFILES: remove recursive policies
DROP POLICY IF EXISTS profiles_select_policy ON public.profiles;
DROP POLICY IF EXISTS "Users can see own profile" ON public.profiles;
DROP POLICY IF EXISTS profiles_update_policy ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY profiles_select_policy ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id
  OR (company_id IS NOT NULL AND company_id = public.get_user_company_id())
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY profiles_update_policy ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = id OR public.has_role(auth.uid(), 'super_admin'::app_role))
WITH CHECK (auth.uid() = id OR public.has_role(auth.uid(), 'super_admin'::app_role));

-- COMPANIES: consolidate duplicated/recursive policies
DROP POLICY IF EXISTS "Users can see their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;
DROP POLICY IF EXISTS "Users can see their company" ON public.companies;
DROP POLICY IF EXISTS companies_select_policy ON public.companies;
DROP POLICY IF EXISTS "Admins can update their own company" ON public.companies;

CREATE POLICY companies_select_policy ON public.companies
FOR SELECT TO authenticated
USING (
  id = public.get_user_company_id()
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

CREATE POLICY companies_update_policy ON public.companies
FOR UPDATE TO authenticated
USING (
  (id = public.get_user_company_id() AND public.has_role(auth.uid(), 'admin'::app_role))
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
)
WITH CHECK (
  (id = public.get_user_company_id() AND public.has_role(auth.uid(), 'admin'::app_role))
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

-- COMPANY_ROLES: replace subquery on profiles with the definer helper
DROP POLICY IF EXISTS company_roles_select_policy ON public.company_roles;

CREATE POLICY company_roles_select_policy ON public.company_roles
FOR SELECT TO authenticated
USING (
  company_id = public.get_user_company_id()
  OR public.has_role(auth.uid(), 'super_admin'::app_role)
);

GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.companies TO authenticated;
GRANT SELECT ON public.company_roles TO authenticated;
