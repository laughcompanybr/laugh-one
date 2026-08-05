import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getBusinessTemplate } from "@/domains/tenants/services/business-template.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function DynamicDashboard() {
  const fetchTemplate = useServerFn(getBusinessTemplate);
  const { data: template, isLoading } = useQuery({
    queryKey: ["business-template"],
    queryFn: () => fetchTemplate(),
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full bg-white/5" />
        ))}
      </div>
    );
  }

  if (!template) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-white/5">
        <CardHeader>
          <CardTitle>Painel padrão</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Configure o segmento da sua empresa para personalizar automaticamente os indicadores,
          módulos e fluxos do Laugh One.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {(template.dashboard_widgets ?? []).map((widget) => (
          <Card key={widget.id} className="bg-card/50 backdrop-blur-sm border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              <Activity className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">Dados em tempo real</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-full lg:col-span-4 bg-card/50 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle>Visão Geral do Segmento: {template.display_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-center text-muted-foreground border-2 border-dashed border-white/5 rounded-lg px-4">
              Gráfico de evolução personalizado para {template.business_type}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-full lg:col-span-3 bg-card/50 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle>Módulos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {(template.enabled_modules ?? []).map((mod) => (
                <li key={mod} className="text-sm capitalize flex items-center gap-2">
                  <div className="size-1.5 rounded-full bg-gold" />
                  {mod}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
