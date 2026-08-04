import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCurrentCompany } from "../legacy/companies.functions";

interface Company {
  id: string;
  name: string;
  display_name: string | null;
  slug: string;
  logo_url: string | null;
  logo_reduced_url: string | null;
  favicon_url: string | null;
  mobile_icon_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  accent_color: string | null;
  success_color: string | null;
  warning_color: string | null;
  error_color: string | null;
  sidebar_color: string | null;
  navbar_color: string | null;
  button_color: string | null;
  card_color: string | null;
  primary_font: string | null;
  secondary_font: string | null;
  theme_mode: string | null;
  border_radius: string | null;
  login_background_url: string | null;
  login_welcome_message: string | null;
  login_title: string | null;
  login_subtitle: string | null;
  login_footer: string | null;
  created_at: string | null;
  updated_at: string | null;
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
