import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getWorkflows = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({
    companyId: z.string(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: workflows, error } = await supabaseAdmin
      .from('automation_workflows' as any)
      .select('*')
      .eq('company_id', data.companyId)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return workflows;
  });

export const createWorkflow = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    company_id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    trigger_config: z.any(),
    steps: z.any(),
  }).parse(data))
  .handler(async ({ data }) => {
    const { data: workflow, error } = await supabaseAdmin
      .from('automation_workflows' as any)
      .insert(data)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return workflow;
  });
