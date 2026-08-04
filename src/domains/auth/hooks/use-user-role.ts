import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useUserRole() {
  const { data: role, isLoading } = useQuery({
    queryKey: ["user-role"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .single();

      return data?.role || 'user';
    },
  });

  return { role, isLoading, isSuperAdmin: role === 'super_admin' };
}
