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

    const [orders, clients, products, employees, payments, expenses, manualTx, receivables] = await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("clients").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("products").select("id, name, stock_qty, min_stock", { count: "exact" }).is("deleted_at", null).eq("status", "active"),
      supabase.from("employees").select("id", { count: "exact", head: true }).is("deleted_at", null),
      supabase.from("payments").select("direction, amount").gte("paid_at", from),
      supabase.from("expenses").select("amount").gte("incurred_at", from.slice(0, 10)),
      supabase.from("financial_transactions").select("direction, amount").eq("status", "paid").gte("paid_at", from),
      supabase.from("orders").select("sale_price, amount_received").is("deleted_at", null).neq("status", "cancelled"),
    ]);

    for (const result of [orders, clients, products, employees, payments, expenses, manualTx, receivables]) {
      if (result.error) throw result.error;
    }

    const productRows = products.data ?? [];
    const lowProducts = productRows
      .filter((p) => Number(p.stock_qty ?? 0) <= Number(p.min_stock ?? 0))
      .sort((a, b) => Number(a.stock_qty ?? 0) - Number(b.stock_qty ?? 0));

    const manualIn = (manualTx.data ?? [])
      .filter((t) => t.direction === "in")
      .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);
    const manualOut = (manualTx.data ?? [])
      .filter((t) => t.direction === "out")
      .reduce((sum, t) => sum + Number(t.amount ?? 0), 0);

    const totalIn =
      (payments.data ?? [])
        .filter((p) => p.direction === "in")
        .reduce((sum, p) => sum + Number(p.amount ?? 0), 0) + manualIn;
    const totalOutPayments =
      (payments.data ?? [])
        .filter((p) => p.direction === "out")
        .reduce((sum, p) => sum + Number(p.amount ?? 0), 0) + manualOut;
    const totalExpenses = (expenses.data ?? []).reduce(
      (sum, p) => sum + Number(p.amount ?? 0),
      0,
    );
    const receivableTotal = (receivables.data ?? []).reduce(
      (sum, o) => sum + Math.max(0, Number(o.sale_price ?? 0) - Number(o.amount_received ?? 0)),
      0,
    );

    return {
      counts: {
        orders: orders.count ?? 0,
        clients: clients.count ?? 0,
        products: products.count ?? 0,
        employees: employees.count ?? 0,
        lowStock: lowProducts.length,
      },
      month: {
        inflow: totalIn,
        outflow: totalOutPayments + totalExpenses,
        net: totalIn - totalOutPayments - totalExpenses,
      },
      receivables: receivableTotal,
      lowStockProducts: lowProducts.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        stock: Number(p.stock_qty ?? 0),
        minimum: Number(p.min_stock ?? 0),
      })),
    };
  });
