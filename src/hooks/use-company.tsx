import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentCompany } from "@/features/companies/companies.functions";

interface Company {
  id: string;
  name: string;
  slug: string;
  logo_url?: string | null;
  favicon_url?: string | null;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  font_family: string;
  theme_mode: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
}

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
    
    // Inject custom colors
    if (company.primary_color) {
      root.style.setProperty("--primary", company.primary_color);
      // We might need to generate oklch or just use hex if the theme supports it.
      // Tailwind v4 @theme allows using CSS variables directly.
    }
    
    if (company.accent_color) {
      root.style.setProperty("--gold", company.accent_color);
      root.style.setProperty("--primary", company.accent_color); // Often primary is the accent in White Label
    }

    if (company.font_family) {
      root.style.setProperty("--font-sans", company.font_family);
      root.style.setProperty("--font-display", company.font_family);
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
    <CompanyContext.Provider value={{ company: company || null, isLoading }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error("useCompany must be used inside <CompanyProvider>");
  return ctx;
}
