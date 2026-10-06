-- Ensure onboarding and module assignments have the uniqueness guarantees
-- required by the frontend upsert operations.
create unique index if not exists company_onboarding_data_company_id_key
  on public.company_onboarding_data (company_id);

create unique index if not exists company_modules_company_id_module_id_key
  on public.company_modules (company_id, module_id);
