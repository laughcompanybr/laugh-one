-- Laugh One: self-service registration and isolated tenant bootstrap
-- Creates one company per newly registered user instead of assigning a shared/default company.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_company_id uuid;
  admin_role_id uuid;
  company_name text;
  base_slug text;
BEGIN
  company_name := COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'company_name'), ''), 'Minha empresa');
  base_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN base_slug := 'empresa'; END IF;

  INSERT INTO public.companies (
    name, display_name, slug, onboarding_status, status
  )
  VALUES (
    company_name,
    company_name,
    left(base_slug, 70) || '-' || substr(replace(NEW.id::text, '-', ''), 1, 8),
    'pending',
    'active'
  )
  RETURNING id INTO new_company_id;

  SELECT id INTO admin_role_id
  FROM public.company_roles
  WHERE company_id = new_company_id
    AND name = 'Administrador'
  LIMIT 1;

  IF admin_role_id IS NULL THEN
    INSERT INTO public.company_roles (
      company_id, name, description, is_system
    )
    VALUES (
      new_company_id,
      'Administrador',
      'Acesso total ao sistema',
      true
    )
    RETURNING id INTO admin_role_id;
  END IF;

  INSERT INTO public.profiles (
    id, full_name, company_id, role_id
  )
  VALUES (
    NEW.id,
    COALESCE(NULLIF(trim(NEW.raw_user_meta_data->>'full_name'), ''), split_part(NEW.email, '@', 1)),
    new_company_id,
    admin_role_id
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
    role_id = COALESCE(public.profiles.role_id, EXCLUDED.role_id);

  INSERT INTO public.subscriptions (
    company_id,
    user_id,
    plan_name,
    billing_period,
    start_date,
    expires_at,
    status,
    amount,
    currency,
    notes
  )
  VALUES (
    new_company_id,
    NEW.id,
    'Plano Completo',
    'monthly',
    now(),
    now() + interval '14 days',
    'active',
    0,
    'BRL',
    'Período de teste inicial'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Safe bootstrap for users created before the self-service registration flow.
CREATE OR REPLACE FUNCTION public.bootstrap_current_user_workspace()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  profile_company_id uuid;
  new_company_id uuid;
  admin_role_id uuid;
  company_name text;
  base_slug text;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  SELECT company_id INTO profile_company_id
  FROM public.profiles
  WHERE id = uid;

  IF profile_company_id IS NOT NULL THEN
    RETURN jsonb_build_object('company_id', profile_company_id, 'created', false);
  END IF;

  SELECT COALESCE(NULLIF(trim(raw_user_meta_data->>'company_name'), ''), 'Minha empresa')
    INTO company_name
  FROM auth.users
  WHERE id = uid;

  base_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN base_slug := 'empresa'; END IF;

  INSERT INTO public.companies (name, display_name, slug, onboarding_status, status)
  VALUES (
    company_name,
    company_name,
    left(base_slug, 70) || '-' || substr(replace(uid::text, '-', ''), 1, 8),
    'pending',
    'active'
  )
  RETURNING id INTO new_company_id;

  SELECT id INTO admin_role_id
  FROM public.company_roles
  WHERE company_id = new_company_id AND name = 'Administrador'
  LIMIT 1;

  IF admin_role_id IS NULL THEN
    INSERT INTO public.company_roles (company_id, name, description, is_system)
    VALUES (new_company_id, 'Administrador', 'Acesso total ao sistema', true)
    RETURNING id INTO admin_role_id;
  END IF;

  INSERT INTO public.profiles (id, full_name, company_id, role_id)
  SELECT uid,
         COALESCE(NULLIF(trim(raw_user_meta_data->>'full_name'), ''), split_part(email, '@', 1)),
         new_company_id,
         admin_role_id
  FROM auth.users
  WHERE id = uid
  ON CONFLICT (id) DO UPDATE SET
    company_id = COALESCE(public.profiles.company_id, EXCLUDED.company_id),
    role_id = COALESCE(public.profiles.role_id, EXCLUDED.role_id);

  INSERT INTO public.subscriptions (
    company_id, user_id, plan_name, billing_period, start_date,
    expires_at, status, amount, currency, notes
  )
  VALUES (
    new_company_id, uid, 'Plano Completo', 'monthly', now(),
    now() + interval '14 days', 'active', 0, 'BRL',
    'Período de teste inicial'
  );

  RETURN jsonb_build_object('company_id', new_company_id, 'created', true);
END;
$$;

REVOKE ALL ON FUNCTION public.bootstrap_current_user_workspace() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.bootstrap_current_user_workspace() TO authenticated;
