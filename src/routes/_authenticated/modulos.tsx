import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useModules } from "@/domains/tenants/hooks/use-modules";
import type { Module } from "@/domains/tenants/hooks/use-modules";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompany } from "@/domains/tenants/hooks/use-company";
import * as Icons from "lucide-react";

export const Route = createFileRoute("/_authenticated/modulos")({
  component: ModulesPage,
});

function ModulesPage() {
  const { modules, enabledModules, isLoading } = useModules();
  const { company } = useCompany();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const handleToggle = async (moduleId: string, enabled: boolean) => {
    if (!company?.id) return;
    
    setTogglingId(moduleId);
    try {
      const { error } = await supabase
        .from("company_modules" as any)
        .upsert({
          company_id: company.id,
          module_id: moduleId,
          is_enabled: enabled,
          updated_at: new Date().toISOString(),
        }, { onConflict: "company_id,module_id" });

      if (error) throw error;
      toast.success(`Módulo ${enabled ? "ativado" : "desativado"} com sucesso!`);
      window.location.reload();
    } catch (error: any) {
      toast.error("Erro ao alterar módulo: " + error.message);
    } finally {
      setTogglingId(null);
    }
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando módulos...</div>;

  const categories = Array.from(new Set(modules.map((m) => m.category)));

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Gestão de Módulos"
        description="Ative ou desative funcionalidades conforme a necessidade da sua empresa."
      />

      {categories.map((category) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-semibold tracking-tight">{category}</h3>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {modules
              .filter((m) => m.category === category)
              .map((module) => {
                const Icon = (Icons as any)[module.icon || "Package"] || Icons.Package;
                const isEnabled = enabledModules.has(module.id);
                
                return (
                  <Card key={module.id} className="relative overflow-hidden transition-all hover:shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                          <Icon className="size-5" />
                        </div>
                        <CardTitle className="text-base">{module.name}</CardTitle>
                      </div>
                      <Switch
                        disabled={module.is_core || togglingId === module.id}
                        checked={isEnabled}
                        onCheckedChange={(checked) => handleToggle(module.id, checked)}
                      />
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="line-clamp-2 min-h-[40px]">
                        {module.description}
                      </CardDescription>
                      <div className="mt-4 flex items-center gap-2">
                        {module.is_core && (
                          <Badge variant="secondary" className="text-[10px]">Essencial</Badge>
                        )}
                        <Badge variant="outline" className="text-[10px]">v{module.version}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
