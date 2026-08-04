import { createContext, useContext, useEffect, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentCompany } from "../legacy/companies.functions";
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
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  useEffect(() => {
    if (!company) return;

    const root = document.documentElement;
    
    // Inject custom colors and variables
    const vars = {
      "--primary": company.primary_color,
      "--secondary": company.secondary_color,
      "--accent": company.accent_color,
      "--success": company.success_color,
      "--warning": company.warning_color,
      "--destructive": company.error_color,
      "--sidebar": company.sidebar_color,
      "--navbar": company.navbar_color,
      "--card": company.card_color,
      "--radius": company.border_radius,
      "--font-sans": company.primary_font ? `'${company.primary_font}', sans-serif` : null,
      "--font-display": company.secondary_font ? `'${company.secondary_font}', sans-serif` : null,
    };

    Object.entries(vars).forEach(([key, value]) => {
      if (value) root.style.setProperty(key, value);
    });

    // Handle Light/Dark Mode
    if (company.theme_mode === 'dark') {
      root.classList.add('dark');
    } else if (company.theme_mode === 'light') {
      root.classList.remove('dark');
    }

    // Update Favicon
    if (company.favicon_url) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = company.favicon_url;
    }

    // Update Title
    if (company.name) {
      document.title = `${company.name} | Laugh One`;
    }

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
