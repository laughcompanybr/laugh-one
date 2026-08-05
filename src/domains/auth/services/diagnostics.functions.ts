import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

export const getRLSDiagnostics = createServerFn({ method: "GET" })
  .handler(async () => {
    // 1. Check for recursion
    const { data: recursionCheck, error: recursionError } = await supabase
      .rpc('check_profiles_recursion');

    // 2. Get active policies
    const { data: policies, error: policiesError } = await supabase
      .rpc('read_query', { 
        query_text: "SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'profiles'" 
      } as any);

    // 3. Test isolation (can I see other tenants?)
    // This is a "blind" test - we just check if we can see any profiles that don't belong to our company
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
