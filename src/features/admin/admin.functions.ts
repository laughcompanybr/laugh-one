import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Helper to verify Super Admin status server-side using the authenticated context
async function checkSuperAdmin(supabase: any, userId: string) {
  const { data: roleData, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error || roleData?.role !== 'super_admin') {
    throw new Error("Acesso negado: Requer privilégios de Super Admin.");
  }
}

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const [companiesRes, activeRes, usersRes] = await Promise.all([
      supabase.from("companies").select("*", { count: 'exact', head: true }),
      supabase.from("companies").select("*", { count: 'exact', head: true }).eq("status", "active"),
      supabase.from("profiles").select("*", { count: 'exact', head: true })
    ]);
    
    return {
      totalCompanies: companiesRes.count || 0,
      activeCompanies: activeRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalClients: 0,
      totalOrders: 0,
      mrr: 0,
      arr: 0,
    };
  });

export const getCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("companies")
      .select("*, plans(name)")
      .order("created_at", { ascending: false });
    
    if (error) throw error;
    return data || [];
  });

export const getPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("plans")
      .select("*")
      .order("price_monthly", { ascending: true });
    
    if (error) throw error;
    return data || [];
  });

export const impersonateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { companyId: string | null }) => z.object({ companyId: z.string().nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ impersonated_company_id: data.companyId })
      .eq("id", userId);

    if (updateError) throw updateError;

    // Registrar log de impersonificação
    const logData = data.companyId 
      ? { user_id: userId, company_id: data.companyId, action: "impersonation_start", metadata: { target_company_id: data.companyId } }
      : { user_id: userId, action: "impersonation_stop" };

    await supabase.from("platform_logs").insert(logData);

    return { success: true };
  });

export const updateCompanyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { id: string, status: string }) => z.object({ id: z.string(), status: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { error } = await supabase
      .from("companies")
      .update({ status: data.status })
      .eq("id", data.id);
    
    if (error) throw error;
    return { success: true };
  });
