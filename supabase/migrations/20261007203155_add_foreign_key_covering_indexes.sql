-- Add covering indexes for foreign keys that do not already have a leftmost matching index.
do $$
declare
  r record;
  idx_name text;
begin
  for r in
    select
      c.conrelid::regclass as table_ref,
      n.nspname as schema_name,
      t.relname as table_name,
      c.conname,
      array_agg(a.attname order by u.ord) as columns
    from pg_constraint c
    join pg_class t on t.oid=c.conrelid
    join pg_namespace n on n.oid=t.relnamespace
    join unnest(c.conkey) with ordinality u(attnum, ord) on true
    join pg_attribute a on a.attrelid=t.oid and a.attnum=u.attnum
    where c.contype='f'
      and n.nspname='public'
      and not exists (
        select 1
        from pg_index i
        where i.indrelid=c.conrelid
          and i.indisvalid
          and i.indpred is null
          and i.indexprs is null
          and i.indnkeyatts >= cardinality(c.conkey)
          and (i.indkey::smallint[])[0:cardinality(c.conkey)-1] = c.conkey
      )
    group by c.conrelid,n.nspname,t.relname,c.conname
  loop
    idx_name := left(
      regexp_replace(r.table_name || '_' || r.conname, '[^a-zA-Z0-9_]', '_', 'g'),
      54
    ) || '_' || substr(md5(r.conname), 1, 8);
    execute format(
      'create index if not exists %I on %s (%s)',
      idx_name,
      r.table_ref,
      (select string_agg(format('%I', col), ', ') from unnest(r.columns) as col)
    );
  end loop;
end
$$;
