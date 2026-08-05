GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

DO $$ 
DECLARE 
    t text;
BEGIN
    FOR t IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
    LOOP
        EXECUTE 'ALTER TABLE public.' || t || ' ENABLE ROW LEVEL SECURITY;';
    END LOOP;
END $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
DECLARE
    comp_id uuid;
    mod_id uuid;
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.companies LIMIT 1) THEN
        INSERT INTO public.companies (name, slug) 
        VALUES ('Laugh One Default', 'laugh-one-default')
        RETURNING id INTO comp_id;
        
        FOR mod_id IN SELECT id FROM public.modules LOOP
            INSERT INTO public.company_modules (company_id, module_id, is_enabled)
            VALUES (comp_id, mod_id, true)
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        INSERT INTO public.company_roles (company_id, name, is_system)
        VALUES (comp_id, 'Administrador', true);
    END IF;
END $$;