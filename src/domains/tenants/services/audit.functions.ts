import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getAuditLogs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) return [];

    const { data, error } = await supabase
      .from("audit_logs_v2")
      .select(`
        *,
        profiles:actor_id (
          full_name,
          avatar_url
        )
      `)
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) throw error;
    return data;
  });
