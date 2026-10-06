import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "./use-company";

export interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  category: string;
  version: string | null;
  status: string | null;
  dependencies: string[];
  main_route: string;
  default_order: number;
  is_core: boolean;
}

interface CompanyModule {
  module_id: string;
  is_enabled: boolean;
  custom_order: number | null;
}

interface ModulesContextType {
  modules: Module[];
  enabledModules: Set<string>;
  isLoading: boolean;
  isModuleEnabled: (moduleId: string) => boolean;
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

function moduleAliases(module: Module): string[] {
  const aliases = new Set<string>([module.id]);
  const routeName = module.main_route.replace(/^\//, "").split("/")[0];
  if (routeName) aliases.add(routeName);

  const nameAliases: Record<string, string> = {
    dashboard: "dashboard",
    pedidos: "orders",
    produtos: "products",
    clientes: "clients",
    fornecedores: "suppliers",
    funcionários: "employees",
    financeiro: "finance",
    relatórios: "reports",
    automações: "automation",
    configurações: "settings",
  };

  const normalizedName = module.name.trim().toLocaleLowerCase("pt-BR");
  const alias = nameAliases[normalizedName];
  if (alias) aliases.add(alias);

  return [...aliases];
}

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { company } = useCompany();
  const [modules, setModules] = useState<Module[]>([]);
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadModules() {
      if (!company?.id) {
        setModules([]);
        setEnabledModules(new Set());
        setIsLoading(false);
        return;
      }

      try {
        const [modulesRes, companyModulesRes] = await Promise.all([
          supabase.from("modules").select("*").order("default_order"),
          supabase.from("company_modules").select("module_id, is_enabled").eq("company_id", company.id),
        ]);

        if (modulesRes.error) throw modulesRes.error;

        const allModules = modulesRes.data as unknown as Module[];
        setModules(allModules);

        const enabled = new Set<string>();
        for (const module of allModules) {
          for (const alias of moduleAliases(module)) enabled.add(alias);
        }
        setEnabledModules(enabled);

        if (companyModulesRes.error) {
          console.warn("Não foi possível carregar as preferências de módulos:", companyModulesRes.error);
        }
      } catch (error) {
        console.error("Error loading modules:", error);
        setModules([]);
        setEnabledModules(new Set());
      } finally {
        setIsLoading(false);
      }
    }

    void loadModules();
  }, [company?.id]);

  const isModuleEnabled = (moduleId: string) => enabledModules.has(moduleId);

  return (
    <ModulesContext.Provider value={{ modules, enabledModules, isLoading, isModuleEnabled }}>
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (context === undefined) {
    throw new Error("useModules must be used within a ModulesProvider");
  }
  return context;
}
