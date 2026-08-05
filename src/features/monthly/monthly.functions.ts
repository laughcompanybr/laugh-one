import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const monthlyReportInput = z.object({
  year: z.number().int(),
  month: z.number().int().min(1).max(12),
});

export interface MonthlyReportData {
  summary: {
    revenue: number;
    received: number;
    expenses: number;
    netProfit: number;
    orderCount: number;
  };
  details: {
    orders: any[];
    financial: {
      entries: any[];
      exits: any[];
      expenses: any[];
    };
  };
  comparison: {
    prevMonthRevenue: number;
    prevMonthProfit: number;
  };
}

export const getMonthlyReport = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((v) => monthlyReportInput.parse(v))
  .handler(async ({ data, context }): Promise<MonthlyReportData> => {
    const { supabase, userId } = context;
    const { year, month } = data;

    // Get company_id context safely
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) throw new Error("Usuário não vinculado a uma empresa.");

    // Calculate dates
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    
    const startOfMonthStr = startOfMonth.toISOString();
    const endOfMonthStr = endOfMonth.toISOString();
    
    const prevMonthDate = new Date(Date.UTC(year, month - 2, 1));
    const prevMonthStartStr = prevMonthDate.toISOString();
    const prevMonthEndStr = new Date(Date.UTC(year, month - 1, 0, 23, 59, 59, 999)).toISOString();

    // Queries scoped by company_id
    const [ordersRes, paymentsRes, expensesRes, prevOrdersRes, prevExpensesRes] = await Promise.all([
      supabase
        .from("orders")
        .select("*, clients(id, name, whatsapp), suppliers(id, name)")
        .eq("company_id", profile.company_id)
        .is("deleted_at", null)
        .gte("created_at", startOfMonthStr)
        .lte("created_at", endOfMonthStr),
      supabase
        .from("payments")
        .select("*, orders(order_number, brand, model, clients(name))")
        .eq("company_id", profile.company_id)
        .gte("paid_at", startOfMonthStr)
        .lte("paid_at", endOfMonthStr),
      supabase
        .from("expenses")
        .select("*")
        .eq("company_id", profile.company_id)
        .gte("incurred_at", startOfMonthStr.slice(0, 10))
        .lte("incurred_at", endOfMonthStr.slice(0, 10)),
      supabase
        .from("orders")
        .select("sale_price, profit")
        .eq("company_id", profile.company_id)
        .is("deleted_at", null)
        .neq("status", "cancelled")
        .gte("created_at", prevMonthStartStr)
        .lte("created_at", prevMonthEndStr),
      supabase
        .from("expenses")
        .select("amount")
        .eq("company_id", profile.company_id)
        .gte("incurred_at", prevMonthStartStr.slice(0, 10))
        .lte("incurred_at", prevMonthEndStr.slice(0, 10)),
    ]);

    if (ordersRes.error) throw ordersRes.error;
    if (paymentsRes.error) throw paymentsRes.error;
    if (expensesRes.error) throw expensesRes.error;

    const orders = ordersRes.data ?? [];
    const payments = paymentsRes.data ?? [];
    const expenses = expensesRes.data ?? [];
    
    const activeOrders = orders.filter(o => o.status !== 'cancelled');
    
    const revenue = activeOrders.reduce((acc, o) => acc + Number(o.sale_price || 0), 0);
    const grossProfit = activeOrders.reduce((acc, o) => acc + Number(o.profit || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    const received = payments.filter(p => p.direction === 'in').reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const exits = payments.filter(p => p.direction === 'out').reduce((acc, p) => acc + Number(p.amount || 0), 0);

    const prevRevenue = (prevOrdersRes.data ?? []).reduce((acc, o) => acc + Number(o.sale_price || 0), 0);
    const prevGrossProfit = (prevOrdersRes.data ?? []).reduce((acc, o) => acc + Number(o.profit || 0), 0);
    const prevExpenses = (prevExpensesRes.data ?? []).reduce((acc, e) => acc + Number(e.amount || 0), 0);

    return {
      summary: {
        revenue,
        received,
        expenses: totalExpenses + exits,
        netProfit: grossProfit - totalExpenses,
        orderCount: activeOrders.length,
      },
      details: {
        orders,
        financial: {
          entries: payments.filter(p => p.direction === 'in'),
          exits: payments.filter(p => p.direction === 'out'),
          expenses,
        },
      },
      comparison: {
        prevMonthRevenue: prevRevenue,
        prevMonthProfit: prevGrossProfit - prevExpenses,
      },
    };
  });
