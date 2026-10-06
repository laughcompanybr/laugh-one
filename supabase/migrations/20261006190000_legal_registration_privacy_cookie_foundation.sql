-- Legal registration, privacy consent and cookie consent foundation.
alter table public.companies
  add column if not exists document_type text,
  add column if not exists document_number text,
  add column if not exists legal_name text,
  add column if not exists trade_name text,
  add column if not exists state_registration text,
  add column if not exists municipal_registration text,
  add column if not exists tax_regime text,
  add column if not exists cnae_primary text,
  add column if not exists postal_code text,
  add column if not exists address_number text,
  add column if not exists address_complement text,
  add column if not exists neighborhood text;

alter table public.profiles
  add column if not exists cpf text,
  add column if not exists phone text,
  add column if not exists accepted_terms_version text,
  add column if not exists accepted_terms_at timestamptz,
  add column if not exists accepted_privacy_version text,
  add column if not exists accepted_privacy_at timestamptz;

create table if not exists public.privacy_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade,
  consent_type text not null check (consent_type in ('terms','privacy','marketing')),
  document_version text not null,
  granted boolean not null,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists privacy_consents_user_idx on public.privacy_consents(user_id, created_at desc);

create table if not exists public.cookie_consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  company_id uuid references public.companies(id) on delete set null,
  consent_version text not null,
  necessary boolean not null default true,
  analytics boolean not null default false,
  marketing boolean not null default false,
  preferences boolean not null default false,
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  user_agent text,
  created_at timestamptz not null default now()
);

create index if not exists cookie_consents_user_idx on public.cookie_consents(user_id, created_at desc);

alter table public.privacy_consents enable row level security;
alter table public.cookie_consents enable row level security;

drop policy if exists privacy_consents_user on public.privacy_consents;
create policy privacy_consents_user on public.privacy_consents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists cookie_consents_user on public.cookie_consents;
create policy cookie_consents_user on public.cookie_consents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists companies_auth on public.companies;
create policy companies_company_access on public.companies
  for all using (id = public.get_user_company_id() or public.has_role(auth.uid(), 'super_admin'::public.app_role))
  with check (id = public.get_user_company_id() or public.has_role(auth.uid(), 'super_admin'::public.app_role));

create or replace function public.record_cookie_consent(
  p_consent_version text,
  p_analytics boolean,
  p_marketing boolean,
  p_preferences boolean,
  p_user_agent text default null
)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_user_id uuid := auth.uid(); v_company_id uuid; v_id uuid;
begin
  if v_user_id is null then raise exception 'Usuário não autenticado'; end if;
  select company_id into v_company_id from public.profiles where id = v_user_id;
  insert into public.cookie_consents(user_id, company_id, consent_version, necessary, analytics, marketing, preferences, user_agent)
  values (v_user_id, v_company_id, p_consent_version, true, p_analytics, p_marketing, p_preferences, p_user_agent)
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.record_cookie_consent(text, boolean, boolean, boolean, text) from anon, public;
grant execute on function public.record_cookie_consent(text, boolean, boolean, boolean, text) to authenticated;

create or replace function public.record_privacy_consent(p_consent_type text, p_document_version text)
returns uuid language plpgsql security definer set search_path = public
as $$
declare v_user_id uuid := auth.uid(); v_company_id uuid; v_id uuid;
begin
  if v_user_id is null then raise exception 'Usuário não autenticado'; end if;
  select company_id into v_company_id from public.profiles where id = v_user_id;
  insert into public.privacy_consents(user_id, company_id, consent_type, document_version, granted)
  values (v_user_id, v_company_id, p_consent_type, p_document_version, true)
  returning id into v_id;
  return v_id;
end;
$$;

revoke execute on function public.record_privacy_consent(text, text) from anon, public;
grant execute on function public.record_privacy_consent(text, text) to authenticated;

notify pgrst, 'reload schema';