-- 1. Ensure RLS is enabled on all critical tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 2. Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Correct RLS for Profiles
DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "profiles_update_policy" ON public.profiles;
CREATE POLICY "profiles_update_policy" ON public.profiles
FOR UPDATE TO authenticated
USING (
  auth.uid() = id OR 
  public.has_role(auth.uid(), 'super_admin')
);

-- 4. Correct RLS for Companies
DROP POLICY IF EXISTS "companies_select_policy" ON public.companies;
CREATE POLICY "companies_select_policy" ON public.companies
FOR SELECT TO authenticated
USING (
  id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  public.has_role(auth.uid(), 'super_admin')
);

-- 5. Correct RLS for Roles & Permissions
DROP POLICY IF EXISTS "company_roles_select_policy" ON public.company_roles;
CREATE POLICY "company_roles_select_policy" ON public.company_roles
FOR SELECT TO authenticated
USING (
  company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid()) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "permissions_select_policy" ON public.permissions;
CREATE POLICY "permissions_select_policy" ON public.permissions
FOR SELECT TO authenticated
USING (true);

DROP POLICY IF EXISTS "role_permissions_select_policy" ON public.role_permissions;
CREATE POLICY "role_permissions_select_policy" ON public.role_permissions
FOR SELECT TO authenticated
USING (
  role_id IN (SELECT id FROM public.company_roles WHERE company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())) OR
  public.has_role(auth.uid(), 'super_admin')
);

-- 6. Trigger to sync auth.users with public.profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_company_id uuid;
  default_role_id uuid;
BEGIN
  -- Try to find a default company
  SELECT id INTO default_company_id FROM public.companies WHERE slug = 'laugh-one-default' LIMIT 1;
  IF default_company_id IS NULL THEN
    SELECT id INTO default_company_id FROM public.companies ORDER BY created_at ASC LIMIT 1;
  END IF;

  -- Find the "Administrador" role for this company
  IF default_company_id IS NOT NULL THEN
    SELECT id INTO default_role_id FROM public.company_roles 
    WHERE company_id = default_company_id AND name = 'Administrador' LIMIT 1;
  END IF;

  INSERT INTO public.profiles (id, full_name, company_id, role_id)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    default_company_id,
    default_role_id
  );
  
  -- Also add to legacy user_roles for compatibility
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. Grant access
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.companies TO authenticated;
GRANT SELECT ON public.company_roles TO authenticated;
GRANT SELECT ON public.permissions TO authenticated;
GRANT SELECT ON public.role_permissions TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.companies TO service_role;
GRANT ALL ON public.company_roles TO service_role;
GRANT ALL ON public.permissions TO service_role;
GRANT ALL ON public.role_permissions TO service_role;
GRANT ALL ON public.user_roles TO service_role;
