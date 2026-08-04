import { ReactNode } from "react";
import { usePermissions } from "@/domains/auth/hooks/use-permissions";

interface CanProps {
  perform: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
  all?: boolean;
}

export function Can({ perform, children, fallback = null, all = false }: CanProps) {
  const { hasPermission } = usePermissions();
  
  const permissions = Array.isArray(perform) ? perform : [perform];
  
  const hasAccess = all 
    ? permissions.every(p => hasPermission(p))
    : permissions.some(p => hasPermission(p));

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
