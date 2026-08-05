import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

export const getModulePermissions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", userId).maybeSingle();
    if (!profile?.company_id) return [];

    const { data, error } = await supabase
      .from("module_permissions")
      .select(`
        *,
        company_roles (name)
      `)
      .eq("company_id", profile.company_id);
    if (error) throw error;
    return data;
  });

export const updateModulePermission = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((d: { roleId: string; moduleId: string; canView: boolean; canEdit: boolean }) => 
    z.object({
      roleId: z.string().uuid(),
      moduleId: z.string(),
      canView: z.boolean(),
      canEdit: z.boolean(),
    }).parse(d)
  )
  .handler(async ({ data: input, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("company_id").eq("id", userId).maybeSingle();
    if (!profile?.company_id) throw new Error("Não autorizado");

    const { error } = await supabase.from("module_permissions").upsert({
      company_id: profile.company_id,
      role_id: input.roleId,
      module_id: input.moduleId,
      can_view: input.canView,
      can_edit: input.canEdit
    }, { onConflict: "role_id,module_id" });

    if (error) throw error;
    return { success: true };
  });
