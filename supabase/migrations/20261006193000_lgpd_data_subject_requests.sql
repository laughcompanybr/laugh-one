create table if not exists public.data_subject_requests (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 company_id uuid references public.companies(id) on delete set null,
 request_type text not null check (request_type in ('access','correction','deletion','portability','revocation','information','other')),
 description text not null,
 status text not null default 'received' check (status in ('received','under_review','completed','rejected')),
 response_notes text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 completed_at timestamptz
);
alter table public.data_subject_requests enable row level security;
create policy "data_subject_requests_select_own" on public.data_subject_requests for select to authenticated using ((select auth.uid()) = user_id);
create policy "data_subject_requests_insert_own" on public.data_subject_requests for insert to authenticated with check ((select auth.uid()) = user_id and company_id = public.get_user_company_id());
create policy "data_subject_requests_update_own" on public.data_subject_requests for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create or replace function public.create_data_subject_request(p_request_type text,p_description text)
returns public.data_subject_requests language plpgsql security invoker set search_path=public as $$
declare v_row public.data_subject_requests;
begin
 if auth.uid() is null then raise exception 'not authenticated'; end if;
 if length(trim(coalesce(p_description,''))) < 5 then raise exception 'description required'; end if;
 insert into public.data_subject_requests(user_id,company_id,request_type,description)
 values(auth.uid(),public.get_user_company_id(),p_request_type,trim(p_description))
 returning * into v_row;
 return v_row;
end; $$;
revoke all on function public.create_data_subject_request(text,text) from public;
grant execute on function public.create_data_subject_request(text,text) to authenticated;
notify pgrst, 'reload schema';