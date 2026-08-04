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

export function ModulesProvider({ children }: { children: ReactNode }) {
  const { company } = useCompany();
  const [modules, setModules] = useState<Module[]>([]);
  const [enabledModules, setEnabledModules] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadModules() {
      if (!company?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const [modulesRes, companyModulesRes] = await Promise.all([
          supabase.from("modules" as any).select("*").order("default_order"),
          supabase.from("company_modules" as any).select("module_id, is_enabled").eq("company_id", company.id)
        ]);

        if (modulesRes.error) throw modulesRes.error;

        const allModules = modulesRes.data as unknown as Module[];
        setModules(allModules);

        const enabled = new Set<string>();
        // Core modules are always enabled if not explicitly disabled
        allModules.filter(m => m.is_core).forEach(m => enabled.add(m.id));

        if (companyModulesRes.data) {
          companyModulesRes.data.forEach((cm: any) => {
            if (cm.is_enabled) {
              enabled.add(cm.module_id);
            } else {
              enabled.delete(cm.module_id);
            }
          });
        }

        setEnabledModules(enabled);
      } catch (error) {
        console.error("Error loading modules:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadModules();
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
