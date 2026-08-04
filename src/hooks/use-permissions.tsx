import { createContext, useContext, ReactNode, useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./use-company";
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
    async function loadUserPermissions() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // 1. Get user profile to find their role_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("role_id")
          .eq("id", user.id)
          .single();

        if (profile?.role_id) {
          setUserRoleId(profile.role_id);
          
          // 2. Get permissions for this role
          const { data: rolePerms } = await supabase
            .from("role_permissions" as any)
            .select("permission_id")
            .eq("role_id", profile.role_id);

          if (rolePerms) {
            setUserPermissions(new Set(rolePerms.map((p: any) => p.permission_id)));
          }
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserPermissions();
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
