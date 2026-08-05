import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { orderSchema, orderFilterSchema, paymentSchema, mixedPaymentsSchema, ORDER_STATUS } from "./schemas";

const idInput = z.object({ id: z.string().uuid() });

export const listOrders = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orderFilterSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;

    let q = (supabase as any)
      .from("orders")
      .select(
        "id, order_number, status, brand, model, reference, quantity, sale_price, cost_price, commission, card_fee, shipping, other_costs, amount_received, profit, purchase_date, expected_delivery, tracking_code, notes, payment_method, created_at, updated_at, deleted_at, client_id, supplier_id, employee_id, clients(id,name,whatsapp), suppliers(id,name), employees(id,full_name)",
        { count: "exact" },
      );

    if (!data.includeDeleted) q = q.is("deleted_at", null);
    if (data.status) q = q.eq("status", data.status);
    if (data.client_id) q = q.eq("client_id", data.client_id);
    if (data.supplier_id) q = q.eq("supplier_id", data.supplier_id);
    if (data.search) {
      const s = data.search.replace(/[%,]/g, " ").trim();
      const asNum = parseInt(s, 10);
      const orFilters = [
        `brand.ilike.%${s}%`,
        `model.ilike.%${s}%`,
        `reference.ilike.%${s}%`,
        `tracking_code.ilike.%${s}%`,
        `notes.ilike.%${s}%`,
      ];
      if (Number.isFinite(asNum)) orFilters.push(`order_number.eq.${asNum}`);
      q = q.or(orFilters.join(","));
    }

    q = q.order(data.sort, { ascending: data.order === "asc", nullsFirst: false }).range(from, to);

    const { data: rows, error, count } = await q;
    if (error) throw error;
    return { rows: rows ?? [], count: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const getOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => idInput.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    
    const [orderRes, paymentsRes, eventsRes] = await Promise.all([
      (supabase as any)
        .from("orders")
        .select("*, clients(id,name,whatsapp,phone,instagram), suppliers(id,name,company,whatsapp), employees(id,full_name,role)")
        .eq("id", data.id)
        .maybeSingle(),
      (supabase as any)
        .from("payments")
        .select("id, direction, amount, method, installments, card_fee, card_fee_percent, paid_at, notes, created_at")
        .eq("order_id", data.id)
        .order("paid_at", { ascending: false }),
      (supabase as any)
        .from("order_events")
        .select("id, type, message, meta, actor, created_at")
        .eq("order_id", data.id)
        .order("created_at", { ascending: false }),
    ]);

    if (orderRes.error) throw orderRes.error;
    if (!orderRes.data) throw new Error("Pedido não encontrado");

    const payments = paymentsRes.data ?? [];
    const totalIn = payments.filter((p: any) => p.direction === "in").reduce((a: number, b: any) => a + Number(b.amount), 0);
    const totalOut = payments.filter((p: any) => p.direction === "out").reduce((a: number, b: any) => a + Number(b.amount), 0);
    const o = orderRes.data as Record<string, any>;
    const qty = Number(o.quantity ?? 1);
    const totalSale = Number(o.sale_price ?? 0) * qty;
    const totalCost = Number(o.cost_price ?? 0) * qty;
    const grossProfit = totalSale - totalCost;
    const netProfit =
      grossProfit -
      Number(o.commission ?? 0) -
      Number(o.card_fee ?? 0) -
      Number(o.shipping ?? 0) -
      Number(o.other_costs ?? 0);

    return {
      order: orderRes.data,
      payments,
      events: eventsRes.data ?? [],
      totals: {
        totalIn,
        totalOut,
        totalSale,
        totalCost,
        grossProfit,
        netProfit,
        balance: totalSale - totalIn,
        profit: Number(o.profit ?? grossProfit),
      },
    };
  });

export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orderSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await (context.supabase as any)
      .from("orders")
      .insert({ ...data, created_by: context.userId, company_id: (context as any).companyId })
      .select("id, order_number")
      .single();
    if (error) throw error;
    return row;
  });

export const updateOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => orderSchema.extend({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { id, ...rest } = data;
    const { error } = await (context.supabase as any).from("orders").update(rest).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const changeOrderStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid(), status: z.enum(ORDER_STATUS) }).parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any).from("orders").update({ status: data.status }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const softDeleteOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => idInput.parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("orders")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const restoreOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => idInput.parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("orders")
      .update({ deleted_at: null })
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const addPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => paymentSchema.extend({ order_id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: row, error } = await (context.supabase as any)
      .from("payments")
      .insert({ ...data, created_by: context.userId, company_id: (context as any).companyId })
      .select("id, direction, amount")
      .single();
    if (error) throw error;

    if (data.direction === "in") {
      const { data: sums, error: sumsError } = await (context.supabase as any)
        .from("payments")
        .select("amount")
        .eq("order_id", data.order_id)
        .eq("direction", "in");
      if (sumsError) throw sumsError;
      const total = (sums ?? []).reduce((a: number, b: any) => a + Number(b.amount), 0);
      const { error: updateError } = await (context.supabase as any)
        .from("orders")
        .update({ amount_received: total })
        .eq("id", data.order_id);
      if (updateError) throw updateError;
    }

    // Timeline logging must never break the payment itself.
    const { error: eventError } = await (context.supabase as any).from("order_events").insert({
      order_id: data.order_id,
      type: "payment",
      message:
        data.direction === "in"
          ? `Pagamento recebido: R$ ${row.amount.toFixed(2)}`
          : `Pagamento efetuado: R$ ${row.amount.toFixed(2)}`,
      meta: { payment_id: row.id, direction: row.direction, amount: row.amount },
      actor: context.userId,
    });
    if (eventError) console.error("[orders] falha ao registrar evento de pagamento:", eventError.message);

    return { id: row.id };
  });

export const deletePayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => z.object({ id: z.string().uuid() }).parse(v))
  .handler(async ({ data, context }) => {
    const { data: row } = await (context.supabase as any)
      .from("payments")
      .select("order_id, direction")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await (context.supabase as any).from("payments").delete().eq("id", data.id);
    if (error) throw error;

    if (row?.order_id && row.direction === "in") {
      const { data: sums } = await (context.supabase as any)
        .from("payments")
        .select("amount")
        .eq("order_id", row.order_id)
        .eq("direction", "in");
      const total = (sums ?? []).reduce((a: number, b: any) => a + Number(b.amount), 0);
      await (context.supabase as any).from("orders").update({ amount_received: total }).eq("id", row.order_id);
    }
    return { ok: true };
  });

export const addMixedPayments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => mixedPaymentsSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const sum = data.entries.reduce((a: number, b: any) => a + Number(b.amount), 0);
    if (data.expected_total > 0 && Math.abs(sum - data.expected_total) > 0.01) {
      throw new Error(
        `A soma dos pagamentos (R$ ${sum.toFixed(2)}) não confere com o total esperado (R$ ${data.expected_total.toFixed(2)}).`,
      );
    }

    const rows = data.entries.map((e) => ({
      order_id: data.order_id,
      direction: e.direction,
      amount: e.amount,
      method: e.method ?? null,
      installments: e.installments,
      card_fee: e.card_fee,
      card_fee_percent: e.card_fee_percent,
      paid_at: e.paid_at,
      notes: e.notes ?? null,
      created_by: userId,
      company_id: (context as any).companyId
    }));

    const { data: inserted, error } = await (supabase as any)
      .from("payments")
      .insert(rows)
      .select("id, direction, amount, method, card_fee, card_fee_percent");
    if (error) throw error;

    const hasIn = (inserted ?? []).some((p: any) => p.direction === "in");
    if (hasIn) {
      const { data: sums } = await (supabase as any)
        .from("payments")
        .select("amount")
        .eq("order_id", data.order_id)
        .eq("direction", "in");
      const total = (sums ?? []).reduce((a: number, b: any) => a + Number(b.amount), 0);
      await (supabase as any).from("orders").update({ amount_received: total }).eq("id", data.order_id);
    }

    const summary = (inserted ?? [])
      .map((p: any) => `${p.method ?? "—"}: R$ ${Number(p.amount).toFixed(2)}${p.card_fee_percent ? ` (taxa ${p.card_fee_percent}% = R$ ${Number(p.card_fee ?? 0).toFixed(2)})` : ""}`)
      .join(" · ");

    await (supabase as any).from("order_events").insert({
      order_id: data.order_id,
      type: "payment",
      message: `Pagamento misto registrado (${inserted?.length ?? 0} entradas): ${summary}`,
      meta: {
        entries: inserted,
        sum,
        expected_total: data.expected_total,
      },
      actor: userId,
    });

    return { ok: true, count: inserted?.length ?? 0, sum };
  });

export const listClientOptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any)
      .from("clients")
      .select("id, name, zip, street, number, complement, district, reference, city, state")
      .is("deleted_at", null)
      .order("name")
      .limit(500);
    if (error) throw error;
    return data ?? [];
  });

export const listSupplierOptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any)
      .from("suppliers")
      .select("id, name")
      .is("deleted_at", null)
      .order("name")
      .limit(500);
    if (error) throw error;
    return data ?? [];
  });
