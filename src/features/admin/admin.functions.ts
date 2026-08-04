import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const getPlatformStats = createServerFn({ method: "GET" })
  .handler(async () => {
    const { count: companiesCount } = await supabase.from("companies").select("*", { count: 'exact', head: true });
    const { count: activeCompanies } = await supabase.from("companies").select("*", { count: 'exact', head: true }).eq("status", "active");
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
    
    return {
      totalCompanies: companiesCount || 0,
      activeCompanies: activeCompanies || 0,
      totalUsers: usersCount || 0,
      totalClients: 0,
      totalOrders: 0,
      mrr: 0,
      arr: 0,
    };
  });

export const getCompanies = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data } = await supabase
      .from("companies")
      .select("*, plans(name)")
      .order("created_at", { ascending: false });
    return data || [];
  });

export const getPlans = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data } = await supabase
      .from("plans")
      .select("*")
      .order("price_monthly", { ascending: true });
    return data || [];
  });

export const impersonateCompany = createServerFn({ method: "POST" })
  .validator((d: { companyId: string | null }) => z.object({ companyId: z.string().nullable() }).parse(d))
  .handler(async ({ data }) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("Unauthorized");

    // Verificar se é Super Admin (serviço ou verificação de role)
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== 'super_admin') throw new Error("Forbidden");

    const { error } = await supabase
      .from("profiles")
      .update({ impersonated_company_id: data.companyId })
      .eq("id", session.user.id);

    if (error) throw error;

    // Registrar log de impersonificação
    if (data.companyId) {
      await supabase.from("platform_logs").insert({
        user_id: session.user.id,
        company_id: data.companyId,
        action: "impersonation_start",
        metadata: { target_company_id: data.companyId }
      });
    } else {
      await supabase.from("platform_logs").insert({
        user_id: session.user.id,
        action: "impersonation_stop"
      });
    }

    return { success: true };
  });

export const updateCompanyStatus = createServerFn({ method: "POST" })
  .validator((d: { id: string, status: string }) => z.object({ id: z.string(), status: z.string() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabase
      .from("companies")
      .update({ status: data.status })
      .eq("id", data.id);
    if (error) throw error;
    return { success: true };
  });
