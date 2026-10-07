-- Cover the remaining foreign key that was not indexed by the initial audit migration.
create index if not exists company_modules_module_id_idx
  on public.company_modules (module_id);
