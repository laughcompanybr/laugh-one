-- Restrict the anonymous database role to the only public table used by the landing page.
do $$
declare
  r record;
begin
  for r in
    select tablename
    from pg_tables
    where schemaname = 'public'
  loop
    execute format('revoke all on table public.%I from anon', r.tablename);
  end loop;
end
$$;

grant select on table public.subscription_pricing to anon;
