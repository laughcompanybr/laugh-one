import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const onboardingSchema = z.object({
  companyName: z.string().min(2),
  businessType: z.string(),
  responsibleName: z.string(),
  phone: z.string(),
  commercialEmail: z.string().email(),
  city: z.string(),
  state: z.string(),
  employeeCount: z.string(),
  mainObjective: z.string(),
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

    if (!profile?.company_id) throw new Error("User has no company linked");

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

    // 3. Auto-enable Modules based on business type
    await setupModulesForBusinessType(supabase, profile.company_id, data.businessType);

    return { success: true };
  });

async function setupModulesForBusinessType(supabase: any, companyId: string, businessType: string) {
  const moduleMap: Record<string, string[]> = {
    'Barbearia': ['dashboard', 'calendar', 'clients', 'services', 'finance', 'reports'],
    'Joalheria': ['dashboard', 'products', 'inventory', 'orders', 'clients', 'finance', 'reports'],
    'Loja de roupas': ['dashboard', 'products', 'inventory', 'orders', 'clients', 'finance', 'reports'],
    'Restaurante': ['dashboard', 'menu', 'orders', 'tables', 'products', 'finance'],
    'Clínica': ['dashboard', 'calendar', 'patients', 'procedures', 'finance', 'reports'],
    'Default': ['dashboard', 'clients', 'orders', 'finance', 'reports']
  };

  const modulesToEnable = moduleMap[businessType] || moduleMap['Default'];

  for (const modId of modulesToEnable) {
    await supabase.from("company_modules").upsert({
      company_id: companyId,
      module_id: modId,
      is_enabled: true
    }, { onConflict: 'company_id,module_id' });
  }
}
