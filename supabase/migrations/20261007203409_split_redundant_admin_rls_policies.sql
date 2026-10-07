-- Split super-admin ALL policies so public/read policies do not overlap on SELECT.
drop policy if exists app_settings_admin on public.app_settings;
create policy app_settings_admin_insert on public.app_settings for insert to authenticated with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy app_settings_admin_update on public.app_settings for update to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role)) with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy app_settings_admin_delete on public.app_settings for delete to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role));

drop policy if exists business_templates_admin on public.business_templates;
create policy business_templates_admin_insert on public.business_templates for insert to authenticated with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy business_templates_admin_update on public.business_templates for update to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role)) with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy business_templates_admin_delete on public.business_templates for delete to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role));

drop policy if exists modules_admin on public.modules;
create policy modules_admin_insert on public.modules for insert to authenticated with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy modules_admin_update on public.modules for update to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role)) with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy modules_admin_delete on public.modules for delete to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role));

drop policy if exists permissions_admin on public.permissions;
create policy permissions_admin_insert on public.permissions for insert to authenticated with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy permissions_admin_update on public.permissions for update to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role)) with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy permissions_admin_delete on public.permissions for delete to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role));

drop policy if exists "Super admin gerencia precos" on public.subscription_pricing;
create policy subscription_pricing_admin_insert on public.subscription_pricing for insert to authenticated with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy subscription_pricing_admin_update on public.subscription_pricing for update to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role)) with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy subscription_pricing_admin_delete on public.subscription_pricing for delete to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role));

drop policy if exists "Super admin gerencia assinaturas" on public.subscriptions;
create policy subscriptions_admin_insert on public.subscriptions for insert to authenticated with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy subscriptions_admin_update on public.subscriptions for update to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role)) with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy subscriptions_admin_delete on public.subscriptions for delete to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role));

drop policy if exists user_roles_admin on public.user_roles;
create policy user_roles_admin_insert on public.user_roles for insert to authenticated with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy user_roles_admin_update on public.user_roles for update to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role)) with check (has_role((select auth.uid()), 'super_admin'::app_role));
create policy user_roles_admin_delete on public.user_roles for delete to authenticated using (has_role((select auth.uid()), 'super_admin'::app_role));
