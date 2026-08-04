-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  sku TEXT,
  category TEXT,
  description TEXT,
  cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  stock_qty INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','archived')),
  image_url TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products_auth_all" ON public.products FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ PRODUCT MOVEMENTS ============
CREATE TABLE IF NOT EXISTS public.product_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('in','out','adjust','sale','sale_revert')),
  qty INTEGER NOT NULL,
  qty_after INTEGER NOT NULL,
  reason TEXT,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  actor UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.product_movements TO authenticated;
GRANT ALL ON public.product_movements TO service_role;
ALTER TABLE public.product_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "product_movements_read" ON public.product_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "product_movements_insert" ON public.product_movements FOR INSERT TO authenticated WITH CHECK (true);

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  name_snapshot TEXT NOT NULL,
  sku_snapshot TEXT,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_sale_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  unit_cost_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_items_auth_all" ON public.order_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============ STOCK FUNCTIONS ============
CREATE OR REPLACE FUNCTION public.apply_order_stock_out(_order_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE it RECORD; new_qty INTEGER; block_flag BOOLEAN;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.order_items WHERE order_id = _order_id AND product_id IS NOT NULL) THEN
    RETURN;
  END IF;
  SELECT COALESCE((value->>'block_when_insufficient')::boolean, true) INTO block_flag
    FROM public.app_settings WHERE key = 'stock';
  IF block_flag IS NULL THEN block_flag := true; END IF;

  FOR it IN
    SELECT product_id, quantity FROM public.order_items
     WHERE order_id = _order_id AND product_id IS NOT NULL FOR UPDATE
  LOOP
    UPDATE public.products SET stock_qty = stock_qty - it.quantity
      WHERE id = it.product_id RETURNING stock_qty INTO new_qty;
    IF new_qty < 0 AND block_flag THEN
      RAISE EXCEPTION 'Estoque insuficiente para o produto %', it.product_id USING ERRCODE = 'check_violation';
    END IF;
    INSERT INTO public.product_movements(product_id, type, qty, qty_after, order_id, actor, reason)
    VALUES (it.product_id, 'sale', -it.quantity, new_qty, _order_id, auth.uid(), 'Baixa por pedido');
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.revert_order_stock(_order_id UUID)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE it RECORD; new_qty INTEGER;
BEGIN
  FOR it IN
    SELECT product_id, quantity FROM public.order_items
     WHERE order_id = _order_id AND product_id IS NOT NULL FOR UPDATE
  LOOP
    UPDATE public.products SET stock_qty = stock_qty + it.quantity
      WHERE id = it.product_id RETURNING stock_qty INTO new_qty;
    INSERT INTO public.product_movements(product_id, type, qty, qty_after, order_id, actor, reason)
    VALUES (it.product_id, 'sale_revert', it.quantity, new_qty, _order_id, auth.uid(), 'Reversão de pedido');
  END LOOP;
END; $$;

CREATE OR REPLACE FUNCTION public.adjust_product_stock(
  _product_id UUID, _type TEXT, _qty INTEGER, _reason TEXT
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_qty INTEGER; delta INTEGER;
BEGIN
  IF _type NOT IN ('in','out','adjust') THEN RAISE EXCEPTION 'Tipo inválido'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.products WHERE id = _product_id) THEN
    RAISE EXCEPTION 'Produto não encontrado';
  END IF;
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sem permissão'; END IF;

  IF _type = 'in' THEN delta := abs(_qty);
  ELSIF _type = 'out' THEN delta := -abs(_qty);
  ELSE delta := _qty;
  END IF;

  UPDATE public.products SET stock_qty = stock_qty + delta
    WHERE id = _product_id RETURNING stock_qty INTO new_qty;

  INSERT INTO public.product_movements(product_id, type, qty, qty_after, reason, actor)
  VALUES (_product_id, _type, delta, new_qty, _reason, auth.uid());

  RETURN new_qty;
END; $$;

GRANT EXECUTE ON FUNCTION public.apply_order_stock_out(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.revert_order_stock(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.adjust_product_stock(UUID, TEXT, INTEGER, TEXT) TO authenticated;

-- ============ STOCK TRIGGER ============
CREATE OR REPLACE FUNCTION public.tg_orders_stock_sync()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  was_delivered BOOLEAN := (OLD.status::text IN ('delivered','entregue'));
  is_delivered  BOOLEAN := (NEW.status::text IN ('delivered','entregue'));
BEGIN
  IF is_delivered AND NOT was_delivered THEN PERFORM public.apply_order_stock_out(NEW.id);
  ELSIF was_delivered AND NOT is_delivered THEN PERFORM public.revert_order_stock(NEW.id);
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_orders_stock_sync ON public.orders;
CREATE TRIGGER trg_orders_stock_sync AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.tg_orders_stock_sync();

-- ============ STORAGE POLICIES (PRODUCT IMAGES) ============
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'product_images_auth' AND tablename = 'objects' AND schemaname = 'storage') THEN
    CREATE POLICY "product_images_auth" ON storage.objects FOR ALL TO authenticated 
    USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');
  END IF;
END $$;
