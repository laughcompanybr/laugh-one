-- Security and consistency cleanup found during the 2026-10-07 project audit.

-- This function is a trigger implementation, not a public RPC endpoint.
revoke all on function public.process_order_automations() from public, anon, authenticated;

-- The original public pricing policy already grants the required SELECT access.
drop policy if exists subscription_pricing_public_read on public.subscription_pricing;

-- app_settings is a key/value table; key is its natural identifier.
alter table public.app_settings
  add constraint app_settings_pkey primary key (key);
