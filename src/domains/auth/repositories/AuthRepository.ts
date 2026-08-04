import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*, companies(*), company_roles(*)")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  });

export const getCompanyUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    
    // Get user's company first
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*, company_roles(*)")
      .eq("company_id", profile.company_id);

    if (error) throw error;
    return data || [];
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { profileId: string, roleId: string }) => 
    z.object({ profileId: z.string(), roleId: z.string() }).parse(d)
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ role_id: data.roleId })
      .eq("id", data.profileId);

    if (error) throw error;
    return { success: true };
  });
