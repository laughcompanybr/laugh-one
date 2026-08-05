import { useSuspenseQuery } from "@tanstack/react-query";
import { getBusinessTemplate } from "@/domains/tenants/services/business-template.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CreditCard, DollarSign, Users } from "lucide-react";

export function DynamicDashboard() {
  const { data: template } = useSuspenseQuery({
    queryKey: ["business-template"],
    queryFn: () => getBusinessTemplate(),
  });

  if (!template) return <div>Carregando painel personalizado...</div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {template.dashboard_widgets.map((widget) => (
          <Card key={widget.id} className="bg-card/50 backdrop-blur-sm border-white/5">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{widget.title}</CardTitle>
              <Activity className="h-4 w-4 text-gold" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">--</div>
              <p className="text-xs text-muted-foreground">
                Dados em tempo real
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle>Visão Geral do Segmento: {template.display_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center text-muted-foreground border-2 border-dashed border-white/5 rounded-lg">
              Gráfico de evolução personalizado para {template.business_type}
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle>Módulos Ativos</CardTitle>
          </CardHeader>
          <CardContent>
             <ul className="space-y-2">
               {template.enabled_modules.map(mod => (
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
