import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getConsent = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data } = await supabase
      .from("user_consent")
      .select("*")
      .eq("user_id", userId)
      .eq("consent_type", "cookies")
      .maybeSingle();
    return data;
  });

export const saveConsent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { granted: boolean }) => z.object({ granted: z.boolean() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase.from("user_consent").upsert({
      user_id: userId,
      consent_type: "cookies",
      granted: data.granted,
    }, { onConflict: "user_id,consent_type" });
    if (error) throw error;
    return { success: true };
  });
