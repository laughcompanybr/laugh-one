import { createFileRoute } from "@tanstack/react-router";
import { DynamicDashboard } from "@/domains/tenants/components/DynamicDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Painel de Controle</h1>
        <p className="text-muted-foreground">
          Bem-vindo ao Laugh One. Tecnologia criada para negócios que evoluem.
        </p>
      </div>

      <DynamicDashboard />
    </div>
  );
}
