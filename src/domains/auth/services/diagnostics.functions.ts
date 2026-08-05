import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getRLSDiagnostics = createServerFn({ method: "GET" })
  .handler(async () => {
    // We use a privileged client for metadata but standard client for isolation testing
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // 1. Check for recursion (using standard client to trigger RLS)
    const { data: recursionCheck, error: recursionError } = await supabase
      .rpc('check_profiles_recursion' as any);

    // 2. Get active policies (using admin client)
    const { data: policies, error: policiesError } = await supabaseAdmin
      .from('pg_policies' as any)
      .select('policyname, cmd, qual')
      .eq('tablename', 'profiles');

    // 3. Test isolation
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, company_id')
      .limit(10);

    return {
      recursionSafe: recursionCheck === true,
      recursionError: recursionError?.message || null,
      policies: policies || [],
      visibleProfilesCount: profiles?.length || 0,
      timestamp: new Date().toISOString()
    };
  });

export const logTelemetry = createServerFn({ method: "POST" })
  .validator((data: { eventType: string; message: string; context?: any }) => 
    z.object({
      eventType: z.string(),
      message: z.string(),
      context: z.any().optional(),
    }).parse(data)
  )
  .handler(async ({ data: input }) => {
    const { error } = await supabase
      .from('system_telemetry')
      .insert({
        event_type: input.eventType,
        message: input.message,
        context: input.context,
        request_id: crypto.randomUUID()
      });

    if (error) throw new Error(error.message);
    return { success: true };
  });
