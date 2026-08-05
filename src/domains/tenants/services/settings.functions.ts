import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(2, "Nome da empresa é obrigatório"),
  business_type: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  commercial_email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  website: z.string().optional(),
  business_description: z.string().optional(),
  employee_count: z.number().optional(),
  services_offered: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  social_media: z.any().optional(),
  system_preferences: z.any().optional(),
  functional_customizations: z.any().optional(),
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

    // Check if user is admin or owner
    const { data: isAdmin } = await supabase.rpc("has_role", { 
      _user_id: userId, 
      _role: 'admin' 
    });
    
    // Also check for 'owner' if role system supports it, or use admin for both as per current logic
    if (!isAdmin) throw new Error("Apenas administradores podem alterar configurações.");

    // Update company
    const { error: companyError } = await supabase
      .from("companies")
      .update({
        name: data.name,
        business_type: data.business_type,
        phone: data.phone,
        whatsapp: data.whatsapp,
        commercial_email: data.commercial_email,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country,
        website: data.website,
        business_description: data.business_description,
        employee_count: data.employee_count,
        services_offered: data.services_offered,
        categories: data.categories,
        social_media: data.social_media,
        system_preferences: data.system_preferences,
        functional_customizations: data.functional_customizations,
      } as any)
      .eq("id", profile.company_id);

    if (companyError) throw companyError;

    // Update onboarding data if exists (syncing basic info)
    await supabase
      .from("company_onboarding_data")
      .update({
        phone: data.phone,
        commercial_email: data.commercial_email,
        city: data.city,
        state: data.state,
        business_type: data.business_type,
      })
      .eq("company_id", profile.company_id);

    return { success: true };
  });

export const getCompanyHistory = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id) throw new Error("Não autorizado.");

    const { data, error } = await supabase
      .from("company_activity_logs")
      .select(`
        *,
        profiles:user_id (
          full_name,
          email
        )
      `)
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  });

export const restoreCompanyField = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { logId: string }) => z.object({ logId: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    const { data: log } = await supabase
      .from("company_activity_logs")
      .select("*")
      .eq("id", data.logId)
      .maybeSingle();

    if (!log || !log.field_changed || log.old_value === null) {
      throw new Error("Log de alteração inválido para restauração.");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (!profile?.company_id || profile.company_id !== log.company_id) {
      throw new Error("Não autorizado.");
    }

    // Update the field back to old_value
    const updateObj: any = {};
    updateObj[log.field_changed] = log.old_value;

    const { error } = await supabase
      .from(log.module === 'company' ? 'companies' : log.module)
      .update(updateObj)
      .eq(log.module === 'company' ? 'id' : 'company_id', profile.company_id);

    if (error) throw error;

    // Log the restoration
    await supabase.from("company_activity_logs").insert({
      company_id: profile.company_id,
      user_id: userId,
      action_type: 'RESTORE',
      module: log.module,
      field_changed: log.field_changed,
      old_value: log.new_value,
      new_value: log.old_value,
      description: `Informação restaurada para uma versão anterior (${log.field_changed}).`
    });

    return { success: true };
  });
