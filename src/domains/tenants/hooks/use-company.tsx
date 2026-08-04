import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentCompany } from "../services/TenantService";
import type { Company } from "../types/tenant.types";

interface CompanyContextValue {
  company: Company | null;
  isLoading: boolean;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { data: company, isLoading } = useQuery({
    queryKey: ["current-company"],
    queryFn: () => getCurrentCompany(),
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (!company) return;
    const root = document.documentElement;
    const vars = {
      "--primary": (company as Company).primary_color,
      "--secondary": (company as Company).secondary_color,
      "--radius": (company as Company).border_radius,
    };
    Object.entries(vars).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });
    if ((company as Company).name) document.title = `${(company as Company).name} | Laugh One`;
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
