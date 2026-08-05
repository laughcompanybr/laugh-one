-- 1. Drop permissive "true" policies
DROP POLICY IF EXISTS "Staff can view employees" ON public.employees;
DROP POLICY IF EXISTS "goals_auth_all" ON public.goals;
DROP POLICY IF EXISTS "financial_tx_auth_all" ON public.financial_transactions;
DROP POLICY IF EXISTS "products_auth_all" ON public.products;
DROP POLICY IF EXISTS "order_items_auth_all" ON public.order_items;
DROP POLICY IF EXISTS "product_movements_read" ON public.product_movements;
DROP POLICY IF EXISTS "product_movements_insert" ON public.product_movements;
DROP POLICY IF EXISTS "client_attachments auth all" ON public.client_attachments;

-- 2. Scoped policies for child tables (no company_id column of their own)
CREATE POLICY "order_items_tenant_isolation" ON public.order_items
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.company_id = public.get_user_company_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_items.order_id AND o.company_id = public.get_user_company_id()));

CREATE POLICY "product_movements_tenant_isolation" ON public.product_movements
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_movements.product_id AND p.company_id = public.get_user_company_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_movements.product_id AND p.company_id = public.get_user_company_id()));

CREATE POLICY "client_attachments_tenant_isolation" ON public.client_attachments
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_attachments.client_id AND c.company_id = public.get_user_company_id()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.clients c WHERE c.id = client_attachments.client_id AND c.company_id = public.get_user_company_id()));

-- 3. Prevent privilege escalation via self profile updates
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role IN ('admin'::app_role, 'super_admin'::app_role)
  ) THEN
    RETURN NEW;
  END IF;

  IF NEW.company_id IS DISTINCT FROM OLD.company_id THEN
    RAISE EXCEPTION 'Alteração de empresa não permitida';
  END IF;

  IF NEW.role_id IS DISTINCT FROM OLD.role_id THEN
    RAISE EXCEPTION 'Alteração de cargo não permitida';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_privilege_escalation();