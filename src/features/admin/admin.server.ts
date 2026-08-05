import type { SupabaseClient } from "@supabase/supabase-js";

/** Garante que o chamador é super admin da plataforma. */
export async function checkSuperAdmin(supabase: SupabaseClient<any>, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "super_admin")
    .maybeSingle();

  if (error || !data) {
    throw new Error("Acesso negado: Requer privilégios de Super Admin.");
  }
}
