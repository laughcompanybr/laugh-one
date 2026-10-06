import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardSnapshot } from "@/domains/tenants/services/dashboard.functions";
import { getBusinessTemplate } from "@/domains/tenants/services/business-template.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ArrowDownRight, ArrowUpRight, Boxes, CircleDollarSign, Package, Users } from "lucide-react";
import { formatBRL } from "@/lib/format";

export function PremiumDashboard() {
  const snapshotFn = useServerFn(getDashboardSnapshot);
  const templateFn = useServerFn(getBusinessTemplate);

  const snapshot = useQuery({
    queryKey: ["dashboard-snapshot"],
    queryFn: () => snapshotFn(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const template = useQuery({
    queryKey: ["business-template"],
    queryFn: () => templateFn(),
    staleTime: 300_000,
  });

  if (snapshot.isLoading || template.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-full rounded-2xl bg-white/5" />
        ))}
      </div>
    );
  }

  const data = snapshot.data;
  const modules = template.data?.enabled_modules ?? [];

  const cards = [
    { label: "Pedidos", value: String(data?.counts.orders ?? "—"), icon: Package },
    { label: "Clientes", value: String(data?.counts.clients ?? "—"), icon: Users },
    { label: "Produtos", value: String(data?.counts.products ?? "—"), icon: Boxes },
    { label: "Saldo do mês", value: data ? formatBRL(data.month.net) : "—", icon: CircleDollarSign },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon }) => (
          <Card key={label} className="glass-panel transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/30">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="mt-2 text-2xl font-display font-semibold text-foreground">{value}</p>
              </div>
              <div className="flex size-11 items-center justify-center rounded-xl bg-gold/10 text-gold">
                <Icon className="size-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Entradas no mês" value={data ? formatBRL(data.month.inflow) : "—"} icon={ArrowUpRight} tone="positive" />
        <Metric label="Saídas no mês" value={data ? formatBRL(data.month.outflow) : "—"} icon={ArrowDownRight} tone="negative" />
        <Metric label="Estoque em atenção" value={String(data?.counts.lowStock ?? "—")} icon={Boxes} tone="warning" />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="glass-panel lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-display text-xl">Visão geral</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ["Entradas", data ? formatBRL(data.month.inflow) : "—"],
                ["Saídas", data ? formatBRL(data.month.outflow) : "—"],
                ["Resultado", data ? formatBRL(data.month.net) : "—"],
                ["Pedidos", String(data?.counts.orders ?? "—")],
                ["Clientes", String(data?.counts.clients ?? "—")],
                ["Estoque crítico", String(data?.counts.lowStock ?? "—")],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border bg-background/30 p-4">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
                  <p className="mt-2 truncate text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-panel lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-display text-xl">
              {template.data?.display_name ?? "Laugh One"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {modules.length ? (
              <div className="flex flex-wrap gap-2">
                {modules.map((module) => (
                  <span key={module} className="rounded-full border border-border bg-background/40 px-3 py-1.5 text-xs capitalize text-muted-foreground">
                    {module.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Activity className="size-4 text-gold" />
                Configure os módulos da empresa para personalizar o painel.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Metric({ label, value, icon: Icon, tone }: {
  label: string;
  value: string;
  icon: typeof ArrowUpRight;
  tone: "positive" | "negative" | "warning";
}) {
  const toneClass = tone === "positive" ? "text-emerald-400" : tone === "negative" ? "text-rose-400" : "text-amber-400";
  return (
    <Card className="glass-panel">
      <CardContent className="flex items-center justify-between p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</p>
          <p className={`mt-2 text-xl font-semibold ${toneClass}`}>{value}</p>
        </div>
        <Icon className={`size-5 ${toneClass}`} />
      </CardContent>
    </Card>
  );
}
