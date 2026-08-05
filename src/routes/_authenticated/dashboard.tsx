import { createFileRoute } from "@tanstack/react-router";
import { DynamicDashboard } from "@/domains/tenants/components/DynamicDashboard";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

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

      <Suspense fallback={<DashboardSkeleton />}>
        <DynamicDashboard />
      </Suspense>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full bg-white/5" />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-7">
        <Skeleton className="col-span-4 h-[300px] bg-white/5" />
        <Skeleton className="col-span-3 h-[300px] bg-white/5" />
      </div>
    </div>
  );
}
