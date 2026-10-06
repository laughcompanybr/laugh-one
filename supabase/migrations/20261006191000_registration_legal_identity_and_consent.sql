create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
declare
  new_company_id uuid; admin_role_id uuid; company_name text; base_slug text;
  legal_name_value text; trade_name_value text; document_type_value text; document_number_value text;
begin
  company_name := coalesce(nullif(trim(NEW.raw_user_meta_data->>'company_name'), ''), 'Minha empresa');
  legal_name_value := nullif(trim(NEW.raw_user_meta_data->>'legal_name'), '');
  trade_name_value := nullif(trim(NEW.raw_user_meta_data->>'trade_name'), '');
  document_type_value := nullif(trim(NEW.raw_user_meta_data->>'document_type'), '');
  document_number_value := nullif(trim(NEW.raw_user_meta_data->>'document_number'), '');
  base_slug := lower(regexp_replace(company_name, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  if base_slug = '' then base_slug := 'empresa'; end if;

  insert into public.companies(name, display_name, slug, legal_name, trade_name, document_type, document_number, onboarding_status, status)
  values(company_name, company_name, left(base_slug,70)||'-'||substr(replace(NEW.id::text,'-',''),1,8),
         legal_name_value, coalesce(trade_name_value, company_name), document_type_value, document_number_value, 'pending','active')
  returning id into new_company_id;

  select id into admin_role_id from public.company_roles where company_id=new_company_id and name='Administrador' limit 1;
  if admin_role_id is null then
    insert into public.company_roles(company_id,name,description,is_system)
    values(new_company_id,'Administrador','Acesso total ao sistema',true) returning id into admin_role_id;
  end if;

  insert into public.profiles(id,full_name,company_id,role_id,cpf,phone,accepted_terms_version,accepted_terms_at,accepted_privacy_version,accepted_privacy_at)
  values(NEW.id,coalesce(nullif(trim(NEW.raw_user_meta_data->>'full_name'),''),split_part(NEW.email,'@',1)),
         new_company_id,admin_role_id,nullif(trim(NEW.raw_user_meta_data->>'cpf'),''),nullif(trim(NEW.raw_user_meta_data->>'phone'),''),
         nullif(trim(NEW.raw_user_meta_data->>'terms_version'),''),now(),
         nullif(trim(NEW.raw_user_meta_data->>'privacy_version'),''),now())
  on conflict(id) do update set company_id=coalesce(public.profiles.company_id,EXCLUDED.company_id), role_id=coalesce(public.profiles.role_id,EXCLUDED.role_id);

  insert into public.privacy_consents(user_id,company_id,consent_type,document_version,granted)
  values(NEW.id,new_company_id,'terms',coalesce(nullif(trim(NEW.raw_user_meta_data->>'terms_version'),''),'2026-10-01'),true),
        (NEW.id,new_company_id,'privacy',coalesce(nullif(trim(NEW.raw_user_meta_data->>'privacy_version'),''),'2026-10-01'),true);

  insert into public.subscriptions(company_id,user_id,plan_name,billing_period,start_date,expires_at,status,amount,currency,notes)
  values(new_company_id,NEW.id,'Plano Completo','monthly',now(),now()+interval '14 days','active',0,'BRL','Período de teste inicial');
  return NEW;
end;
$$;