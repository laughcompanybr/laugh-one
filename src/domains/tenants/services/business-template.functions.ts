import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export interface BusinessTemplate {
  business_type: string;
  display_name: string;
  enabled_modules: string[];
  dashboard_widgets: { id: string; title: string }[];
  terminology: Record<string, string>;
  custom_fields?: any;
  workflows?: any;
}

export const getBusinessTemplate = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    // 1. Get user's company and business type
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) return null;

    const { data: company } = await supabase
      .from("companies")
      .select("business_type")
      .eq("id", profile.company_id)
      .maybeSingle();

    if (!company?.business_type) return null;

    // 2. Fetch template for that business type
    // Use string type for table to bypass typecheck if types are stale
    const { data: template } = await supabase
      .from("business_templates" as any)
      .select("*")
      .eq("business_type", company.business_type)
      .maybeSingle();

    return template as BusinessTemplate | null;
  });
