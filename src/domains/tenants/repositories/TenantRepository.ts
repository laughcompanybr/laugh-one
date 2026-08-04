import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getCurrentCompany = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError || !profile?.company_id) return null;

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .maybeSingle();

    if (companyError) {
      console.error("[TenantRepo] Error fetching company:", companyError);
      return null;
    }

    return company;
  });
