import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  dateRangeSchema,
  expenseFilterSchema,
  expenseSchema,
  financialTxFilterSchema,
  financialTxSchema,
  goalSchema,
  payablesFilterSchema,
} from "./schemas";

const idInput = z.object({ id: z.string().uuid() });

function toISO(d: string, endOfDay = false) {
  return endOfDay ? `${d}T23:59:59.999Z` : `${d}T00:00:00.000Z`;
}

export const getCashFlow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => dateRangeSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const fromISO = toISO(data.from);
    const toEndISO = toISO(data.to, true);

    const [paymentsRes, expensesRes, txRes] = await Promise.all([
      (supabase as any)
        .from("payments")
        .select("id, direction, amount, method, paid_at, notes, order_id, orders(order_number, brand, model, clients(name), suppliers(name))")
        .gte("paid_at", fromISO)
        .lte("paid_at", toEndISO)
        .order("paid_at", { ascending: false }),
      (supabase as any)
        .from("expenses")
        .select("id, description, amount, category, incurred_at")
        .gte("incurred_at", data.from)
        .lte("incurred_at", data.to)
        .order("incurred_at", { ascending: false }),
      (supabase as any)
        .from("financial_transactions")
        .select("id, direction, amount, method, paid_at, description, category, status")
        .eq("status", "paid")
        .not("paid_at", "is", null)
        .gte("paid_at", fromISO)
        .lte("paid_at", toEndISO),
    ]);

    if (paymentsRes.error) throw paymentsRes.error;
    if (expensesRes.error) throw expensesRes.error;
    if (txRes.error) throw txRes.error;

    const payments = paymentsRes.data ?? [];
    const expenses = expensesRes.data ?? [];
    const manualTx = txRes.data ?? [];

    const totalInPayments = payments
      .filter((p: any) => p.direction === "in")
      .reduce((a: number, b: any) => a + Number(b.amount), 0);
    const totalOutPayments = payments
      .filter((p: any) => p.direction === "out")
      .reduce((a: number, b: any) => a + Number(b.amount), 0);
    const totalInManual = manualTx
      .filter((t: any) => t.direction === "in")
      .reduce((a: number, b: any) => a + Number(b.amount), 0);
    const totalOutManual = manualTx
      .filter((t: any) => t.direction === "out")
      .reduce((a: number, b: any) => a + Number(b.amount), 0);
    const totalExpenses = expenses.reduce((a: number, b: any) => a + Number(b.amount), 0);
    const totalIn = totalInPayments + totalInManual;
    const totalOut = totalOutPayments + totalOutManual + totalExpenses;

    const bucket = (iso: string) => {
      const d = new Date(iso);
      if (data.granularity === "month") {
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      }
      return d.toISOString().slice(0, 10);
    };

    const series = new Map<string, { key: string; inflow: number; outflow: number }>();
    const ensure = (k: string) => {
      if (!series.has(k)) series.set(k, { key: k, inflow: 0, outflow: 0 });
      return series.get(k)!;
    };
    for (const p of payments) {
      const row = ensure(bucket(p.paid_at));
      if (p.direction === "in") row.inflow += Number(p.amount);
      else row.outflow += Number(p.amount);
    }
    for (const t of manualTx) {
      if (!t.paid_at) continue;
      const row = ensure(bucket(t.paid_at));
      if (t.direction === "in") row.inflow += Number(t.amount);
      else row.outflow += Number(t.amount);
    }
    for (const e of expenses) {
      ensure(bucket(e.incurred_at + "T12:00:00Z")).outflow += Number(e.amount);
    }
    const chart = Array.from(series.values())
      .sort((a, b) => a.key.localeCompare(b.key))
      .map((r) => ({ ...r, net: r.inflow - r.outflow }));

    const byCategory = new Map<string, number>();
    for (const e of expenses) {
      const k = e.category ?? "Outros";
      byCategory.set(k, (byCategory.get(k) ?? 0) + Number(e.amount));
    }
    for (const t of manualTx) {
      if (t.direction !== "out") continue;
      const k = t.category ?? "Outros";
      byCategory.set(k, (byCategory.get(k) ?? 0) + Number(t.amount));
    }
    const categories = Array.from(byCategory.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    return {
      totals: {
        totalIn,
        totalOut,
        totalOutPayments,
        totalExpenses,
        totalInManual,
        totalOutManual,
        net: totalIn - totalOut,
      },
      chart,
      categories,
      payments,
      expenses,
      manualTx,
    };
  });

export const listReceivables = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await (context.supabase as any)
      .from("orders")
      .select("id, order_number, status, sale_price, amount_received, expected_delivery, created_at, clients(id,name)")
      .is("deleted_at", null)
      .neq("status", "cancelled")
      .order("expected_delivery", { ascending: true, nullsFirst: false });
    if (error) throw error;
    const rows = (data ?? [])
      .map((o: any) => ({
        ...o,
        balance: Number(o.sale_price ?? 0) - Number(o.amount_received ?? 0),
      }))
      .filter((r) => r.balance > 0.009);
    const total = rows.reduce((a, b) => a + b.balance, 0);
    return { rows, total };
  });

export const listPayables = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => payablesFilterSchema.parse(v ?? {}))
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const [ordersRes, paymentsRes] = await Promise.all([
      (supabase as any)
        .from("orders")
        .select("id, order_number, status, cost_price, expected_delivery, purchase_date, created_at, suppliers(id,name)")
        .is("deleted_at", null)
        .neq("status", "cancelled")
        .gt("cost_price", 0),
      (supabase as any).from("payments").select("order_id, amount, direction").eq("direction", "out"),
    ]);
    if (ordersRes.error) throw ordersRes.error;
    if (paymentsRes.error) throw paymentsRes.error;
    const paidByOrder = new Map<string, number>();
    for (const p of (paymentsRes.data ?? [])) {
      if (!p.order_id) continue;
      paidByOrder.set(p.order_id, (paidByOrder.get(p.order_id) ?? 0) + Number(p.amount));
    }
    const today = new Date().toISOString().slice(0, 10);
    const search = (data.search ?? "").toLowerCase().trim();
    const rows = (ordersRes.data ?? [])
      .map((o: any) => {
        const paid = paidByOrder.get(o.id) ?? 0;
        return { ...o, paid, balance: Number(o.cost_price ?? 0) - paid };
      })
      .filter((r) => r.balance > 0.009)
      .filter((r) => {
        if (!search) return true;
        const hay = `${r.suppliers?.name ?? ""} #${r.order_number}`.toLowerCase();
        return hay.includes(search);
      })
      .filter((r) => {
        const due = r.expected_delivery ?? r.purchase_date ?? null;
        if (data.from && due && due < data.from) return false;
        if (data.to && due && due > data.to) return false;
        if (data.statusFilter === "overdue") return !!due && due < today;
        if (data.statusFilter === "upcoming") {
          if (!due) return false;
          const diff = (new Date(due).getTime() - new Date(today).getTime()) / 86400000;
          return diff >= 0 && diff <= 7;
        }
        if (data.statusFilter === "future") return !!due && due > today;
        if (data.statusFilter === "no_date") return !due;
        return true;
      })
      .sort((a, b) => (a.expected_delivery ?? "9999").localeCompare(b.expected_delivery ?? "9999"));
    const total = rows.reduce((a, b) => a + b.balance, 0);
    return { rows, total };
  });

export const getPayableHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        order_id: z.string().uuid(),
        page: z.number().int().min(1).default(1),
        pageSize: z.number().int().min(1).max(100).default(20),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const from = (data.page - 1) * data.pageSize;
    const to = from + data.pageSize - 1;
    const { data: rows, error, count } = await (context.supabase as any)
      .from("payments")
      .select("id, amount, method, paid_at, notes, direction", { count: "exact" })
      .eq("order_id", data.order_id)
      .eq("direction", "out")
      .order("paid_at", { ascending: false })
      .range(from, to);
    if (error) throw error;
    return { rows: rows ?? [], total: count ?? 0, page: data.page, pageSize: data.pageSize };
  });

export const listExpenses = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => expenseFilterSchema.parse(v))
  .handler(async ({ data, context }) => {
    let q = (context.supabase as any)
      .from("expenses")
      .select("id, description, amount, category, incurred_at, created_at")
      .gte("incurred_at", data.from)
      .lte("incurred_at", data.to)
      .order("incurred_at", { ascending: false });
    if (data.category) q = q.eq("category", data.category);
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const createExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => expenseSchema.parse(v))
  .handler(async ({ data, context }) => {
    const { data: inserted, error } = await (context.supabase as any)
      .from("expenses")
      .insert({
        description: data.description,
        amount: data.amount,
        category: data.category,
        incurred_at: data.incurred_at,
        created_by: context.userId,
        company_id: (context as any).companyId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true };
  });

export const deleteExpense = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => idInput.parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any).from("expenses").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const listFinancialTransactions = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => financialTxFilterSchema.parse(v))
  .handler(async ({ data, context }) => {
    const fromISO = `${data.from}T00:00:00.000Z`;
    const toISO = `${data.to}T23:59:59.999Z`;
    let q = (context.supabase as any)
      .from("financial_transactions")
      .select("id, direction, status, description, category, amount, method, due_date, paid_at, notes, created_at")
      .or(
        `and(paid_at.gte.${fromISO},paid_at.lte.${toISO}),and(due_date.gte.${data.from},due_date.lte.${data.to})`,
      )
      .order("created_at", { ascending: false });
    if (data.direction) q = q.eq("direction", data.direction);
    if (data.status) q = q.eq("status", data.status);
    if (data.search) {
      const s = data.search.replace(/[%,()]/g, " ");
      q = q.or(`description.ilike.%${s}%,category.ilike.%${s}%,notes.ilike.%${s}%`);
    }
    const { data: rows, error } = await q;
    if (error) throw error;
    return rows ?? [];
  });

export const createFinancialTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => financialTxSchema.parse(v))
  .handler(async ({ data, context }) => {
    const paid_at =
      data.status === "paid"
        ? data.paid_at
          ? new Date(data.paid_at).toISOString()
          : new Date().toISOString()
        : null;
    const { data: inserted, error } = await (context.supabase as any)
      .from("financial_transactions")
      .insert({
        direction: data.direction,
        status: data.status,
        description: data.description,
        category: data.category || null,
        amount: data.amount,
        method: data.method || null,
        due_date: data.due_date || null,
        paid_at,
        notes: data.notes || null,
        created_by: context.userId,
        company_id: (context as any).companyId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true };
  });

export const deleteFinancialTransaction = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => idInput.parse(v))
  .handler(async ({ data, context }) => {
    const { error } = await (context.supabase as any)
      .from("financial_transactions")
      .delete()
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const markTxPaidSchema = z.object({
  id: z.string().uuid(),
  paid_at: z.string().optional().nullable(),
  method: z.string().trim().max(40).optional().nullable(),
});

export const markTransactionPaid = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => markTxPaidSchema.parse(v))
  .handler(async ({ data, context }) => {
    const patch: any = {
      status: "paid",
      paid_at: data.paid_at ? new Date(data.paid_at).toISOString() : new Date().toISOString(),
    };
    if (data.method) patch.method = data.method;
    const { error } = await (context.supabase as any)
      .from("financial_transactions")
      .update(patch)
      .eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

const payPayableSchema = z.object({
  order_id: z.string().uuid(),
  amount: z.number().positive(),
  method: z.string().trim().max(40).optional().nullable(),
  paid_at: z.string().optional().nullable(),
  notes: z.string().trim().max(500).optional().nullable(),
});

export const payPayable = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => payPayableSchema.parse(v))
  .handler(async ({ data, context }) => {
    const paidAt = data.paid_at
      ? new Date(data.paid_at).toISOString()
      : new Date().toISOString();
    const { data: inserted, error } = await (context.supabase as any)
      .from("payments")
      .insert({
        order_id: data.order_id,
        direction: "out",
        amount: data.amount,
        method: data.method || null,
        paid_at: paidAt,
        notes: data.notes || null,
        company_id: (context as any).companyId,
      })
      .select("id")
      .single();
    if (error) throw error;
    return { ok: true };
  });

export const bulkPayPayables = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) =>
    z
      .object({
        items: z.array(
          z.object({
            order_id: z.string().uuid(),
            amount: z.number().positive(),
          }),
        ),
        method: z.string().trim().max(40),
        paid_at: z.string().optional().nullable(),
      })
      .parse(v),
  )
  .handler(async ({ data, context }) => {
    const paidAt = data.paid_at
      ? new Date(data.paid_at).toISOString()
      : new Date().toISOString();
    const rows = data.items.map((i) => ({
      order_id: i.order_id,
      direction: "out",
      amount: i.amount,
      method: data.method,
      paid_at: paidAt,
      company_id: (context as any).companyId,
    }));
    const { error } = await (context.supabase as any).from("payments").insert(rows);
    if (error) throw error;
    return { ok: true };
  });
