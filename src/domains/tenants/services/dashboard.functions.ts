import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

function monthStart() {
  const d = new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1)).toISOString();
}

export const getDashboardSnapshot = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const from = monthStart();

    const [orders, clients, products, employees, payments, expenses] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("clients").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("products").select("id, stock_qty, min_stock", { count: "exact" }).is("deleted_at", null).eq("status", "active"),
      supabase.from("employees").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("payments").select("direction, amount").gte("paid_at", from),
      supabase.from("expenses").select("amount").gte("incurred_at", from.slice(0, 10)),
    ]);

    for (const result of [orders, clients, products, employees, payments, expenses]) {
      if (result.error) throw result.error;
    }

    const productRows = products.data ?? [];
    const lowStock = productRows.filter(
      (p) => Number(p.stock_qty ?? 0) <= Number(p.min_stock ?? 0),
    ).length;

    const totalIn = (payments.data ?? [])
      .filter((p) => p.direction === "in")
      .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
    const totalOutPayments = (payments.data ?? [])
      .filter((p) => p.direction === "out")
      .reduce((sum, p) => sum + Number(p.amount ?? 0), 0);
    const totalExpenses = (expenses.data ?? []).reduce(
      (sum, p) => sum + Number(p.amount ?? 0),
      0,
    );

    return {
      counts: {
        orders: orders.count ?? 0,
        clients: clients.count ?? 0,
        products: products.count ?? 0,
        employees: employees.count ?? 0,
        lowStock,
      },
      month: {
        inflow: totalIn,
        outflow: totalOutPayments + totalExpenses,
        net: totalIn - totalOutPayments - totalExpenses,
      },
    };
  });
