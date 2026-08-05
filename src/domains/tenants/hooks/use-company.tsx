import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentCompany } from "../services/TenantService";
import type { Company } from "../types/tenant.types";
import { useHasSession } from "@/hooks/use-session";

interface CompanyContextValue {
  company: Company | null;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { hasSession } = useHasSession();
  const { data: company, isLoading } = useQuery({
    queryKey: ["current-company"],
    queryFn: () => getCurrentCompany(),
    staleTime: 1000 * 60 * 10,
    enabled: hasSession,
    retry: false,
  });

  useEffect(() => {
    if (!company) return;
    const root = document.documentElement;
    const vars = {
      "--primary": company.primary_color,
      "--secondary": company.secondary_color,
      "--accent": company.accent_color,
      "--radius": company.border_radius,
    };
    Object.entries(vars).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });
    if (company.name) document.title = `${company.name} | Laugh One`;
  }, [company]);

  return (
    <CompanyContext.Provider value={{ company: (company as Company) || null, isLoading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used inside <CompanyProvider>");
  return ctx;
}
