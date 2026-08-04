import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getPlatformStats = createServerFn({ method: "GET" })
  .handler(async () => {
    // Verificação de super_admin seria feita aqui via middleware ou has_role
    const { count: companiesCount } = await supabase.from("companies").select("*", { count: 'exact', head: true });
    
    // Fallback safer queries for stats
    const { count: activeCompanies } = await supabase.from("companies").select("*", { count: 'exact', head: true });
    const { count: usersCount } = await supabase.from("profiles").select("*", { count: 'exact', head: true });
    const { count: clientsCount } = await supabase.from("clients").select("*", { count: 'exact', head: true });
    
    return {
      totalCompanies: companiesCount || 0,
      activeCompanies: activeCompanies || 0,
      totalUsers: usersCount || 0,
      totalClients: clientsCount || 0,
      totalOrders: 0,
      mrr: 0,
      arr: 0,
    };
  });

export const getCompaniesList = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data } = await supabase
      .from("companies")
      .select("*")
      .order("created_at", { ascending: false });
    return data || [];
  });
