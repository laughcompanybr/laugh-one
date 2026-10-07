-- Optimize RLS policies by evaluating stable auth/helper calls once per statement.
do $$
declare
  p record;
  new_qual text;
  new_check text;
begin
  for p in
    select schemaname, tablename, policyname, qual, with_check
    from pg_policies
    where schemaname='public'
      and (
        (qual is not null and (qual like '%auth.%' or qual like '%get_user_company_id()%'))
        or
        (with_check is not null and (with_check like '%auth.%' or with_check like '%get_user_company_id()%'))
      )
  loop
    new_qual := p.qual;
    new_check := p.with_check;

    if new_qual is not null and new_qual not like '%(select auth.%' then
      new_qual := replace(new_qual, 'auth.uid()', '(select auth.uid())');
      new_qual := replace(new_qual, 'auth.jwt()', '(select auth.jwt())');
      new_qual := replace(new_qual, 'get_user_company_id()', '(select get_user_company_id())');
    end if;

    if new_check is not null and new_check not like '%(select auth.%' then
      new_check := replace(new_check, 'auth.uid()', '(select auth.uid())');
      new_check := replace(new_check, 'auth.jwt()', '(select auth.jwt())');
      new_check := replace(new_check, 'get_user_company_id()', '(select get_user_company_id())');
    end if;

    if new_qual is distinct from p.qual and new_check is distinct from p.with_check then
      execute format('alter policy %I on %I.%I using (%s) with check (%s)',
        p.policyname, p.schemaname, p.tablename, new_qual, new_check);
    elsif new_qual is distinct from p.qual then
      execute format('alter policy %I on %I.%I using (%s)',
        p.policyname, p.schemaname, p.tablename, new_qual);
    elsif new_check is distinct from p.with_check then
      execute format('alter policy %I on %I.%I with check (%s)',
        p.policyname, p.schemaname, p.tablename, new_check);
    end if;
  end loop;
end
$$;
