import { createFileRoute } from "@tanstack/react-router";
import { DynamicDashboard } from "@/domains/tenants/components/DynamicDashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="container mx-auto py-10 px-6 sm:px-8 lg:px-12 max-w-7xl">
      <div className="mb-12 space-y-2">
        <h1 className="text-4xl font-display font-medium tracking-tight text-white">Painel de Controle</h1>
        <p className="text-white/50 font-light text-lg">
          Bem-vindo ao Laugh One. Tecnologia criada para negócios que evoluem.
        </p>
      </div>

      <DynamicDashboard />
    </div>
  );
}
