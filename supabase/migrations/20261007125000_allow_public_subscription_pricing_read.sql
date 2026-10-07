-- Allow the pricing catalog to be read by the public pricing endpoint.
-- Prices contain no tenant-specific data and are safe to expose to anonymous visitors.

drop policy if exists subscription_pricing_public_read on public.subscription_pricing;

create policy subscription_pricing_public_read
on public.subscription_pricing
as permissive
for select
to anon, authenticated
using (true);
