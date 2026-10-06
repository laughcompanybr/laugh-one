import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardSnapshot } from "@/domains/tenants/services/dashboard.functions";
import { getBusinessTemplate } from "@/domains/tenants/services/business-template.functions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ArrowDownRight, ArrowUpRight, Boxes, CircleDollarSign, Package, Users, Plus, Settings2, FileText, UserRoundPlus } from "lucide-react";
import { Link } from "@tanstack/react-router";
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
        <Metric label="A receber" value={data ? formatBRL(data.receivables) : "—"} icon={CircleDollarSign} tone="warning" />
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

      {data && data.counts.orders === 0 && data.counts.clients === 0 && data.counts.products === 0 ? (
        <Card className="glass-panel border-gold/20">
          <CardHeader>
            <CardTitle className="font-display text-xl">Comece por aqui</CardTitle>
            <p className="text-sm text-muted-foreground">Sua empresa já está conectada. Agora cadastre os primeiros dados para transformar o painel em uma operação completa.</p>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <QuickAction to="/pedidos" icon={Plus} title="Criar pedido" description="Registre sua primeira venda." />
            <QuickAction to="/clientes" icon={UserRoundPlus} title="Cadastrar cliente" description="Monte sua base de clientes." />
            <QuickAction to="/produtos" icon={Boxes} title="Cadastrar produto" description="Comece o controle de estoque." />
            <QuickAction to="/configuracoes" icon={Settings2} title="Configurar empresa" description="Complete os dados da organização." />
          </CardContent>
        </Card>
      ) : null}

      {(data?.lowStockProducts?.length ?? 0) > 0 ? (
        <Card className="glass-panel">
          <CardHeader><CardTitle className="font-display text-xl">Atenção no estoque</CardTitle></CardHeader>
          <CardContent>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {data!.lowStockProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-border bg-background/30 p-3">
                  <p className="truncate text-sm font-medium">{product.name}</p>
                  <p className="mt-1 text-xs text-amber-400">{product.stock} em estoque · mínimo {product.minimum}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
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
function QuickAction({ to, icon: Icon, title, description }: { to: string; icon: typeof Plus; title: string; description: string }) {
  return (
    <Link to={to as any} className="group rounded-xl border border-border bg-background/30 p-4 transition-all hover:-translate-y-0.5 hover:border-gold/40">
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-gold/10 text-gold">
        <Icon className="size-4" />
      </div>
      <p className="font-semibold group-hover:text-gold transition-colors">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </Link>
  );
}

}
