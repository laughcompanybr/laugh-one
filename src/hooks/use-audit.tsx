import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./use-company";

export function useAudit() {
  const { company } = useCompany();

  const logAction = useCallback(async (params: {
    action: string;
    module_id?: string;
    description?: string;
    entity_id?: string;
    entity_type?: string;
    new_value?: any;
    old_value?: any;
    status?: 'success' | 'error';
    metadata?: any;
  }) => {
    if (!company?.id) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("audit_logs" as any)
        .insert({
          company_id: company.id,
          user_id: user?.id,
          user_name: user?.user_metadata?.full_name || user?.email,
          action: params.action,
          module_id: params.module_id,
          description: params.description,
          entity_id: params.entity_id,
          entity_type: params.entity_type,
          new_value: params.new_value,
          old_value: params.old_value,
          status: params.status || 'success',
          metadata: params.metadata,
          ip_address: "client-side", // Simplified for demo
        });

      if (error) console.error("Audit log error:", error);
    } catch (e) {
      console.error("Failed to log action:", e);
    }
  }, [company?.id]);

  return { logAction };
}
