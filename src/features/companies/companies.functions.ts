import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";

export const getCurrentCompany = createServerFn({ method: "GET" })
  .handler(async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", sessionData.session.user.id)
      .single();

    if (!profile?.company_id) return null;

    const { data: company } = await supabase
      .from("companies")
      .select("*")
      .eq("id", profile.company_id)
      .single();

    return company;
  });
