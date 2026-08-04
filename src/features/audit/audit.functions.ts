import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const logEvent = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    action: z.string(),
    module_id: z.string().optional(),
    description: z.string().optional(),
    entity_id: z.string().optional(),
    entity_type: z.string().optional(),
    new_value: z.any().optional(),
    old_value: z.any().optional(),
    status: z.string().optional(),
    metadata: z.any().optional(),
  }).parse(data))
  .handler(async ({ data }) => {
    // In a real environment, we'd get company_id and user_id from context
    return { success: true };
  });

export const getAuditLogs = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    companyId: z.string(),
    limit: z.number().default(50),
    offset: z.number().default(0),
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: logs, error } = await supabaseAdmin
      .from('audit_logs' as any)
      .select('*')
      .eq('company_id', data.companyId)
      .order('created_at', { ascending: false })
      .range(data.offset, data.offset + data.limit - 1);

    if (error) throw new Error(error.message);
    return logs;
  });
