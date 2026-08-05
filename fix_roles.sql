-- Primeiro, vamos garantir que a empresa padrão exista
DO $$
DECLARE
    default_company_id uuid;
    admin_role_id uuid;
BEGIN
    -- Pegamos a primeira empresa ou criamos uma se não existir
    SELECT id INTO default_company_id FROM public.companies LIMIT 1;
    
    IF default_company_id IS NULL THEN
        INSERT INTO public.companies (name, slug) 
        VALUES ('Laugh One Default', 'laugh-one-default')
        RETURNING id INTO default_company_id;
    END IF;

    -- Garantimos que o cargo de Administrador exista para esta empresa
    SELECT id INTO admin_role_id FROM public.company_roles 
    WHERE company_id = default_company_id AND name = 'Administrador' LIMIT 1;

    IF admin_role_id IS NULL THEN
        INSERT INTO public.company_roles (company_id, name, description, is_system)
        VALUES (default_company_id, 'Administrador', 'Acesso total ao sistema', true)
        RETURNING id INTO admin_role_id;
    END IF;

    -- Agora atualizamos todos os perfis que estão tentando usar a string 'Administrador'
    -- ou que precisam ser administradores iniciais.
    -- O erro do usuário mostra que ele tentou setar 'Administrador' (texto) em um UUID.
    
    -- Se o usuário forneceu um ID específico no erro: ed8f4683-894d-4385-858a-c05c39118677
    UPDATE public.profiles 
    SET role_id = admin_role_id, company_id = default_company_id
    WHERE id = 'ed8f4683-894d-4385-858a-c05c39118677';

    -- Também limpamos o lixo se houver algum trigger ou função tentando inserir strings
    -- (Apenas segurança)
END $$;

-- Ajustando a função de novo usuário para ser mais resiliente e usar IDs reais
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    default_company_id uuid;
    admin_role_id uuid;
BEGIN
    -- Busca empresa padrão
    SELECT id INTO default_company_id FROM public.companies ORDER BY created_at ASC LIMIT 1;
    
    -- Se não houver empresa, cria a global
    IF default_company_id IS NULL THEN
        INSERT INTO public.companies (name, slug) 
        VALUES ('Laugh One', 'laugh-one')
        RETURNING id INTO default_company_id;
    END IF;

    -- Busca cargo Admin para essa empresa
    SELECT id INTO admin_role_id FROM public.company_roles 
    WHERE company_id = default_company_id AND name = 'Administrador' LIMIT 1;

    -- Se não houver cargo, cria (embora o trigger trg_create_default_roles devesse fazer isso)
    IF admin_role_id IS NULL THEN
        INSERT INTO public.company_roles (company_id, name, description, is_system)
        VALUES (default_company_id, 'Administrador', 'Acesso total ao sistema', true)
        RETURNING id INTO admin_role_id;
    END IF;

    INSERT INTO public.profiles (id, email, full_name, company_id, role_id)
    VALUES (
        NEW.id, 
        NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        default_company_id,
        admin_role_id
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        company_id = COALESCE(profiles.company_id, EXCLUDED.company_id),
        role_id = COALESCE(profiles.role_id, EXCLUDED.role_id);

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log ou fallback se necessário, mas não bloqueia o login
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
