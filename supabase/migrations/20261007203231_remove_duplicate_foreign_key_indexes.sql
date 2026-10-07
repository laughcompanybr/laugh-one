-- Remove duplicate indexes created by the first audit pass.
drop index if exists public.client_attachments_client_attachments_client_id_fkey_idx;
drop index if exists public.clients_clients_company_id_fkey_idx;
drop index if exists public.order_attachments_order_attachments_order_id_fkey_idx;
drop index if exists public.order_events_order_events_order_id_fkey_idx;
drop index if exists public.order_items_order_items_order_id_fkey_idx;
drop index if exists public.orders_orders_company_id_fkey_idx;
drop index if exists public.product_movements_product_movements_order_id_fkey_idx;
drop index if exists public.product_movements_product_movements_product_id_fkey_idx;
drop index if exists public.products_products_company_id_fkey_idx;
drop index if exists public.subscriptions_subscriptions_company_id_fkey_idx;
