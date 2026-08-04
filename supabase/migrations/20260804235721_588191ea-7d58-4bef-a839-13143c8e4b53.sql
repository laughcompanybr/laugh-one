-- 1. Ensure public.profiles is fully permissive for internal triggers
GRANT ALL ON public.profiles TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;

-- 2. Refine handle_new_user trigger to be more robust
-- This trigger runs when a user is created via Supabase Auth (e.g., Lovable Cloud Users panel)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  default_company_id uuid;
  default_role_id uuid;
BEGIN
  -- Attempt to find a default company, but don't fail if none exists
  -- New users created via admin panel might not have metadata yet
  SELECT id INTO default_company_id FROM public.companies WHERE slug = 'laugh-one-default' LIMIT 1;
  
  -- If not found by slug, take the first one ever created (seed company)
  IF default_company_id IS NULL THEN
    SELECT id INTO default_company_id FROM public.companies ORDER BY created_at ASC LIMIT 1;
  END IF;

  -- Find the "Administrador" role for this company if possible
  IF default_company_id IS NOT NULL THEN
    SELECT id INTO default_role_id FROM public.company_roles 
    WHERE company_id = default_company_id AND name = 'Administrador' LIMIT 1;
  END IF;

  -- Insert profile with optional company/role (allow NULLs for flexibility)
  -- The core requirement is that profile creation NEVER fails, as it would rollback auth.users creation
  BEGIN
    INSERT INTO public.profiles (id, full_name, company_id, role_id)
    VALUES (
      new.id, 
      COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
      default_company_id,
      default_role_id
    );
  EXCEPTION WHEN OTHERS THEN
    -- Fallback: insert only the ID if anything else fails
    INSERT INTO public.profiles (id, full_name)
    VALUES (new.id, new.email);
  END;
  
  -- Also add to legacy user_roles for compatibility if the table exists
  BEGIN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (new.id, 'user')
    ON CONFLICT (user_id, role) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Table might not exist or be different, ignore
  END;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Adjust RLS policies to be more resilient for new users without company_id
-- We need to ensure that a user who JUST joined and hasn't been assigned a company_id
-- can still see their own profile and basic metadata to avoid "Server Error" on UI load.

DROP POLICY IF EXISTS "profiles_select_policy" ON public.profiles;
CREATE POLICY "profiles_select_policy" ON public.profiles
FOR SELECT TO authenticated
USING (
  auth.uid() = id OR 
  (company_id IS NOT NULL AND company_id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())) OR
  public.has_role(auth.uid(), 'super_admin')
);

DROP POLICY IF EXISTS "companies_select_policy" ON public.companies;
CREATE POLICY "companies_select_policy" ON public.companies
FOR SELECT TO authenticated
USING (
  (id IN (SELECT company_id FROM public.profiles WHERE id = auth.uid())) OR
  public.has_role(auth.uid(), 'super_admin')
);

-- 4. Audit constraints on profiles
-- Ensure updated_at has a default or isn't strictly enforced in a way that breaks inserts
ALTER TABLE public.profiles ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.profiles ALTER COLUMN created_at SET DEFAULT now();

-- 5. Grant permissions to execute the has_role helper
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, text) TO service_role;
