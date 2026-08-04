import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/domains/tenants/hooks/use-company";
import { useUserRole } from "./use-user-role";

interface PermissionsContextType {
  permissions: Set<string>;
  isLoading: boolean;
  hasPermission: (permissionId: string) => boolean;
  isAdmin: boolean;
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { company } = useCompany();
  const { isSuperAdmin } = useUserRole();
  const [userPermissions, setUserPermissions] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [userRoleId, setUserRoleId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadUserPermissions() {
      setIsLoading(true);
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError || !authData.user) {
        if (isMounted) {
          setUserPermissions(new Set());
          setIsLoading(false);
        }
        return;
      }

      try {
        // 1. Get user profile to find their role_id
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role_id")
          .eq("id", authData.user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const roleId = profile?.role_id;

        if (roleId) {
          if (isMounted) setUserRoleId(roleId);
          
          const { data: rolePerms, error: permsError } = await supabase
            .from("role_permissions")
            .select("permission_id")
            .eq("role_id", roleId);

          if (permsError) throw permsError;

          if (isMounted && rolePerms) {
            setUserPermissions(new Set(rolePerms.map((p: any) => p.permission_id)));
          }
        } else {
          if (isMounted) setUserPermissions(new Set());
        }
      } catch (error) {
        console.error("[Permissions] Error loading permissions:", error);
        if (isMounted) setUserPermissions(new Set());
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUserPermissions();
    return () => { isMounted = false; };
  }, [company?.id]);

  const hasPermission = useMemo(() => (permissionId: string) => {
    if (isSuperAdmin) return true;
    return userPermissions.has(permissionId);
  }, [userPermissions, isSuperAdmin]);

  const isAdmin = useMemo(() => {
    if (isSuperAdmin) return true;
    return userPermissions.has("settings.manage");
  }, [userPermissions, isSuperAdmin]);

  return (
    <PermissionsContext.Provider value={{ permissions: userPermissions, isLoading, hasPermission, isAdmin }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions() {
  const context = useContext(PermissionsContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionsProvider");
  }
  return context;
}
