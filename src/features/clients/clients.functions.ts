import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { clientSchema, clientFilterSchema } from "./schemas";

const idInput = z.object({ id: z.string().uuid() });

export const listClients = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => clientFilterSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = (supabase as any)
      .from("clients")
      .select(
        "id, name, cpf, phone, whatsapp, instagram, zip, street, number, complement, district, reference, city, state, notes, created_at, updated_at, deleted_at",
        { count: "exact" },
      );

    if (!data.includeDeleted) q = q.is("deleted_at", null);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, " ").trim();
      q = q.or(
        `name.ilike.%${s}%,cpf.ilike.%${s}%,phone.ilike.%${s}%,whatsapp.ilike.%${s}%,instagram.ilike.%${s}%,city.ilike.%${s}%`,
      );
    }
    if (data.state) q = q.eq("state", data.state);

    q = q.order(data.sort, { ascending: data.order === "asc" }).range(from, to);

    const { data: rows, error, count } = await q;
    if (error) throw error;
    return { rows: rows ?? [], count: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const getClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => idInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    
    const [clientRes, historyRes, ordersRes] = await Promise.all([
      (supabase as any).from("clients").select("*").eq("id", data.id).maybeSingle(),
      (supabase as any)
        .from("company_activity_logs")
        .select("*")
        .eq("module", "clients")
        .eq("company_id", (context as any).companyId)
        .order("created_at", { ascending: false })
        .limit(50),
      (supabase as any)
        .from("orders")
        .select("id, order_number, status, brand, model, sale_price, quantity, created_at")
        .eq("client_id", data.id)
        .is("deleted_at", null)
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    if (clientRes.error) throw clientRes.error;
    if (!clientRes.data) throw new Error("Cliente não encontrado");

    return {
      client: clientRes.data,
      history: historyRes.data ?? [],
      orders: ordersRes.data ?? [],
    };
  });

export const createClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => clientSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: row, error } = await (supabase as any)
      .from("clients")
      .insert({ ...data, created_by: userId, company_id: (context as any).companyId })
      .select("id")
      .single();
    if (error) throw error;
    return { id: row.id };
  });

export const updateClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => clientSchema.extend({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = await (context.supabase as any).from("clients").update(rest).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const softDeleteClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => idInput.parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("clients")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const restoreClient = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => idInput.parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("clients")
      .update({ deleted_at: null })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
