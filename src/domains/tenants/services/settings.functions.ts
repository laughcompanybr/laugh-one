import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(2, "Nome da empresa é obrigatório"),
  logo_url: z.string().nullable(),
  business_type: z.string(),
  responsible_name: z.string(),
  phone: z.string(),
  commercial_email: z.string().email(),
  city: z.string(),
  state: z.string(),
});

export const getCompanyDetails = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) throw new Error("Empresa não encontrada.");

    const { data: company, error } = await supabase
      .from("companies")
      .select(`
        *,
        company_onboarding_data (*)
      `)
      .eq("id", profile.company_id)
      .maybeSingle();

    if (error) throw error;
    return company;
  });

export const updateCompanySettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: z.infer<typeof updateCompanySchema>) => updateCompanySchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) throw new Error("Não autorizado.");

    // Check if user is admin
    const { data: isAdmin } = await supabase.rpc("has_role", { 
      _user_id: userId, 
      _role: 'admin' 
    });

    if (!isAdmin) throw new Error("Apenas administradores podem alterar configurações.");

    // Update company
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name: data.name,
        logo_url: data.logo_url,
        business_type: data.business_type,
      } as any)
      .eq("id", profile.company_id);

    if (companyError) throw companyError;

    // Update onboarding data (pii)
    const { error: onboardingError } = await supabase
      .from("company_onboarding_data")
      .update({
        responsible_name: data.responsible_name,
        phone: data.phone,
        commercial_email: data.commercial_email,
        city: data.city,
        state: data.state,
        business_type: data.business_type,
      })
      .eq("company_id", profile.company_id);

    if (onboardingError) throw onboardingError;

    return { success: true };
  });
