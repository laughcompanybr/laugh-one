import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const onboardingSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  businessType: z.string().min(1, "Selecione o segmento"),
  responsibleName: z.string().min(2, "Nome do responsável é obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  commercialEmail: z.string().email("E-mail inválido"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  employeeCount: z.string().min(1, "Selecione a quantidade de funcionários"),
  mainObjective: z.string().min(1, "Selecione o objetivo"),
  logoUrl: z.string().optional(),
});

export const getOnboardingStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) return { status: 'no_company' };

    const { data: onboarding } = await supabase
      .from("company_onboarding_data")
      .select("onboarding_completed")
      .eq("company_id", profile.company_id)
      .maybeSingle();

    return { 
      status: onboarding?.onboarding_completed ? 'completed' : 'pending',
      companyId: profile.company_id 
    };
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: z.infer<typeof onboardingSchema>) => onboardingSchema.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) throw new Error("Usuário não está vinculado a uma empresa.");

    // 1. Update Company Basic Info
    const { error: companyError } = await supabase
      .from("companies")
      .update({ 
        name: data.companyName,
        logo_url: data.logoUrl || null,
        business_type: data.businessType,
        onboarding_status: 'completed'
      } as any)
      .eq("id", profile.company_id);

    if (companyError) throw companyError;

    // 2. Save Onboarding Details
    const { error: onboardingError } = await supabase
      .from("company_onboarding_data")
      .upsert({
        company_id: profile.company_id,
        business_type: data.businessType,
        responsible_name: data.responsibleName,
        phone: data.phone,
        commercial_email: data.commercialEmail,
        city: data.city,
        state: data.state,
        employee_count: data.employeeCount,
        main_objective: data.mainObjective,
        onboarding_completed: true
      })
      .eq("company_id", profile.company_id);

    if (onboardingError) throw onboardingError;

    // 3. Auto-enable Modules and Setup Template based on business type
    await setupBusinessContext(supabase, profile.company_id, data.businessType);

    return { success: true };
  });

async function setupBusinessContext(supabase: any, companyId: string, businessType: string) {
  // Fetch template to know which modules to enable
  const { data: template } = await supabase
    .from("business_templates")
    .select("enabled_modules")
    .eq("business_type", businessType)
    .maybeSingle();

  const modulesToEnable = template?.enabled_modules || ['dashboard', 'clients', 'orders', 'finance', 'reports'];

  // Enable modules for the company
  for (const modId of modulesToEnable) {
    await supabase.from("company_modules").upsert({
      company_id: companyId,
      module_id: modId,
      is_enabled: true
    }, { onConflict: 'company_id,module_id' });
  }
}