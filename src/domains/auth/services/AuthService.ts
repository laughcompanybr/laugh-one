import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getProfile as getProfileRepo,
  getCompanyUsers as getCompanyUsersRepo,
  updateUserRole as updateUserRoleRepo
} from "../repositories/AuthRepository";

export const getProfile = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const { data, error } = await supabase
      .from("profiles")
      .select("*, companies!profiles_company_id_fkey(*), company_roles(*)")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  });

export const getCompanyUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("company_id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) throw profileError;
    if (!profile?.company_id) return [];

    const { data, error } = await supabase
      .from("profiles")
      .select("*, company_roles(*)")
      .eq("company_id", profile.company_id);

    if (error) throw error;
    return data || [];
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .validator((d: { profileId: string, roleId: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { error } = await supabase
      .from("profiles")
      .update({ role_id: data.roleId })
      .eq("id", data.profileId);

    if (error) throw error;
    return { success: true };
  });

export const bootstrapUserWorkspace = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase.rpc("bootstrap_current_user_workspace" as any);
    if (error) throw new Error(error.message);
    return data;
  });
