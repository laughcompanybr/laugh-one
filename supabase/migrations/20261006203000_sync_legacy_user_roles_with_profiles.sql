create unique index if not exists user_roles_user_id_key
  on public.user_roles (user_id);

insert into public.user_roles (user_id, role)
select
  p.id,
  case
    when lower(coalesce(cr.name, '')) like '%super%' then 'super_admin'::public.app_role
    when lower(coalesce(cr.name, '')) like '%admin%' then 'admin'::public.app_role
    else 'staff'::public.app_role
  end
from public.profiles p
left join public.company_roles cr on cr.id = p.role_id
where p.id is not null
on conflict (user_id) do update
set role = excluded.role;

create or replace function public.sync_user_role_compat()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
declare
  resolved_role public.app_role;
begin
  select case
    when lower(coalesce(cr.name, '')) like '%super%' then 'super_admin'::public.app_role
    when lower(coalesce(cr.name, '')) like '%admin%' then 'admin'::public.app_role
    else 'staff'::public.app_role
  end
  into resolved_role
  from public.company_roles cr
  where cr.id = new.role_id;

  if resolved_role is not null then
    insert into public.user_roles (user_id, role)
    values (new.id, resolved_role)
    on conflict (user_id) do update
      set role = excluded.role;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_sync_user_roles_compat on public.profiles;

create trigger profiles_sync_user_roles_compat
after insert or update of role_id on public.profiles
for each row
execute function public.sync_user_role_compat();

revoke all on function public.sync_user_role_compat() from public;
grant execute on function public.sync_user_role_compat() to authenticated;
