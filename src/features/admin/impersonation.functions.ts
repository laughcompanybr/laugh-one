import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const stopImpersonation = createServerFn({ method: "POST" })
  .handler(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return { success: false };

    await supabase
      .from("profiles")
      .update({ impersonated_company_id: null })
      .eq("id", session.user.id);

    return { success: true };
  });

export const getImpersonationStatus = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data } = await supabase
      .from("profiles")
      .select("impersonated_company_id, companies(name)")
      .eq("id", session.user.id)
      .single();

    if (!data?.impersonated_company_id) return null;

    return {
      companyId: data.impersonated_company_id,
      companyName: (data as any).companies?.name || "Empresa"
    };
  });
