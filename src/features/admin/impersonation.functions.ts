import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const stopImpersonation = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { error } = await supabase
      .from("profiles")
      .update({ impersonated_company_id: null })
      .eq("id", userId);

    if (error) {
      console.error("[Impersonation] Error stopping impersonation:", error);
      throw new Error("Falha ao encerrar impersonificação.");
    }

    return { success: true };
  });

export const getImpersonationStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data, error } = await supabase
      .from("profiles")
      .select("impersonated_company_id, companies(name)")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("[Impersonation] Error fetching status:", error);
      return null;
    }

    if (!data?.impersonated_company_id) return null;

    return {
      companyId: data.impersonated_company_id,
      companyName: (data as any).companies?.name || "Empresa"
    };
  });
