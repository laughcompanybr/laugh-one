-- 1. Get the admin role ID and company ID safely
DO $$
DECLARE
    v_company_id uuid;
    v_admin_role_id uuid;
    v_user_id uuid := 'ed8f4683-894d-4385-858a-c05c39118677';
BEGIN
    -- Find or create company
    SELECT id INTO v_company_id FROM public.companies ORDER BY created_at ASC LIMIT 1;
    IF v_company_id IS NULL THEN
        INSERT INTO public.companies (name, slug) VALUES ('Laugh One', 'laugh-one') RETURNING id INTO v_company_id;
    END IF;

    -- Find or create admin role
    SELECT id INTO v_admin_role_id FROM public.company_roles WHERE company_id = v_company_id AND name = 'Administrador' LIMIT 1;
    IF v_admin_role_id IS NULL THEN
        INSERT INTO public.company_roles (company_id, name, description, is_system)
        VALUES (v_company_id, 'Administrador', 'Acesso total', true)
        RETURNING id INTO v_admin_role_id;
    END IF;

    -- Correct the user's data with valid UUIDs
    UPDATE public.profiles 
    SET role_id = v_admin_role_id, 
        company_id = v_company_id 
    WHERE id = v_user_id;
END $$;

-- 2. Hardening the trigger function to prevent this error in the future
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_company_id uuid;
    v_role_id uuid;
BEGIN
    -- Atomic lookup for default company
    SELECT id INTO v_company_id FROM public.companies ORDER BY created_at ASC LIMIT 1;
    
    -- Fallback if no company exists
    IF v_company_id IS NULL THEN
        INSERT INTO public.companies (name, slug) 
        VALUES ('Laugh One', 'laugh-one')
        RETURNING id INTO v_company_id;
    END IF;

    -- Atomic lookup for Admin role
    SELECT id INTO v_role_id FROM public.company_roles 
    WHERE company_id = v_company_id AND (name = 'Administrador' OR is_system = true) 
    ORDER BY created_at ASC LIMIT 1;

    -- Final fallback to create the role if missing
    IF v_role_id IS NULL THEN
        INSERT INTO public.company_roles (company_id, name, description, is_system)
        VALUES (v_company_id, 'Administrador', 'Cargo administrativo automático', true)
        RETURNING id INTO v_role_id;
    END IF;

    -- Upsert profile with proper UUIDs
    INSERT INTO public.profiles (id, email, full_name, company_id, role_id)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        v_company_id,
        v_role_id
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        company_id = COALESCE(profiles.company_id, EXCLUDED.company_id),
        role_id = COALESCE(profiles.role_id, EXCLUDED.role_id);

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Prevent auth rollback on profile failure, but log might be needed in a real env
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
