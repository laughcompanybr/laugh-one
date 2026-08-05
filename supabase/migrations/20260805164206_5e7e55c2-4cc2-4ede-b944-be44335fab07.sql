-- user_roles
CREATE POLICY "user_roles_select_own" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'super_admin'::app_role));

CREATE POLICY "user_roles_admin_manage" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'super_admin'::app_role));

-- order_events (scoped through the parent order)
CREATE POLICY "order_events_tenant_isolation" ON public.order_events
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_events.order_id AND o.company_id = public.get_user_company_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_events.order_id AND o.company_id = public.get_user_company_id()));

-- system_telemetry
CREATE POLICY "system_telemetry_insert" ON public.system_telemetry
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "system_telemetry_read_admin" ON public.system_telemetry
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role) OR public.has_role(auth.uid(), 'super_admin'::app_role));

GRANT SELECT ON public.user_roles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_events TO authenticated;
GRANT SELECT, INSERT ON public.system_telemetry TO authenticated;
GRANT ALL ON public.user_roles, public.order_events, public.system_telemetry TO service_role;