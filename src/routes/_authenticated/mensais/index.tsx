import { createFileRoute, Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronRight, LayoutDashboard, Package, Wallet } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function MensaisIndexPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestão"
        title="Relatórios Mensais"
        description="Organização e fechamento operacional por períodos mensais."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {MONTHS.map((monthName, index) => {
          const monthNum = index + 1;
          const isFuture = index > currentMonth;
          
          return (
            <Card 
              key={monthName} 
              className={`group transition-all hover:shadow-md ${isFuture ? 'opacity-60' : ''}`}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-lg">
                  <span className="flex items-center gap-2">
                    <Calendar className="size-4 text-gold" />
                    {monthName}
                  </span>
                  <span className="text-xs font-normal text-muted-foreground">{currentYear}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-xs text-muted-foreground">
                    Visualize pedidos, financeiro e indicadores de {monthName.toLowerCase()}.
                  </p>
                  <Button asChild variant="outline" className="w-full group-hover:bg-gold group-hover:text-black">
                    <Link to={`/mensais/${monthNum}`}>
                      Abrir Relatório
                      <ChevronRight className="ml-2 size-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/mensais/")({
  component: MensaisIndexPage,
});
