import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Company } from "@/domains/tenants/types/tenant.types";
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
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", userId)
        .maybeSingle();

      if (profileError) throw profileError;
      if (!profile?.company_id) return null;

      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("*")
        .eq("id", profile.company_id)
        .maybeSingle();

      if (companyError) throw companyError;
      return companyData as Company | null;
    },
    staleTime: 1000 * 60 * 10,
    enabled: hasSession,
    retry: 2,
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

    if (company.name) document.title = company.name + " | Laugh One";
  }, [company]);

  return (
    <CompanyContext.Provider value={{ company: company ?? null, isLoading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used inside <CompanyProvider>");
  return ctx;
}
