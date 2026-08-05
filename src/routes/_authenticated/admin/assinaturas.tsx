import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { CreditCard, Plus, RefreshCcw, Ban, Search } from "lucide-react";
import {
  getSubscriptions,
  getCompanies,
  upsertSubscription,
  updateSubscription,
} from "@/features/admin/admin.functions";
import {
  BILLING_PERIODS,
  PERIOD_LABELS,
  PLAN_NAME,
  calculateExpiry,
  formatPrice,
  type BillingPeriod,
} from "@/domains/tenants/subscriptions/types";
import { getSubscriptionPricing } from "@/domains/tenants/subscriptions/subscriptions.functions";

export const Route = createFileRoute("/_authenticated/admin/assinaturas")({
  component: AdminSubscriptions,
  head: () => ({
    meta: [
      { title: "Assinaturas | Laugh One Admin" },
      {
        name: "description",
        content:
          "Gerencie as assinaturas do Plano Completo do Laugh One: períodos, validade e status.",
      },
      { property: "og:title", content: "Assinaturas | Laugh One Admin" },
      {
        property: "og:description",
        content: "Controle central das assinaturas do Plano Completo no Laugh One.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
});

function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data: subscriptions, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-subscriptions"],
    queryFn: () => getSubscriptions(),
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string; status: "active" | "canceled" | "suspended" | "expired" }) =>
      updateSubscription({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      toast.success("Assinatura atualizada.");
    },
    onError: (err: any) => toast.error("Erro ao atualizar: " + err.message),
  });

  const filtered = (subscriptions ?? []).filter((sub: any) =>
    (sub.companies?.name ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <PageHeader
          title="Assinaturas"
          description={`Plano único: ${PLAN_NAME}. O que muda é apenas o período contratado.`}
        />
        <SubscriptionDialog />
      </div>

      <Card className="p-0 overflow-hidden border-gold/10">
        <div className="p-4 border-b border-gold/10 bg-muted/30 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empresa..."
              className="pl-9 bg-background"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {isError ? (
          <div className="p-12 text-center space-y-4">
            <p className="text-muted-foreground">Não foi possível carregar as assinaturas.</p>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCcw className="mr-2 size-4" /> Tentar novamente
            </Button>
          </div>
        ) : isLoading ? (
          <div className="p-12 text-center text-muted-foreground">Carregando assinaturas...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CreditCard className="size-10 mx-auto text-gold/40" />
            <p className="font-medium">Nenhuma assinatura encontrada</p>
            <p className="text-sm text-muted-foreground">
              Crie uma assinatura do {PLAN_NAME} para uma empresa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gold/10 bg-muted/30 text-muted-foreground font-medium">
                  <th className="px-6 py-4 text-left">Empresa</th>
                  <th className="px-6 py-4 text-left">Plano</th>
                  <th className="px-6 py-4 text-left">Período</th>
                  <th className="px-6 py-4 text-left">Valor</th>
                  <th className="px-6 py-4 text-left">Início</th>
                  <th className="px-6 py-4 text-left">Vencimento</th>
                  <th className="px-6 py-4 text-left">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {filtered.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-gold/5 transition-colors">
                    <td className="px-6 py-4 font-bold">{sub.companies?.name ?? "—"}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="border-gold/30 text-gold bg-gold/5">
                        {sub.plan_name}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {PERIOD_LABELS[sub.billing_period as BillingPeriod]}
                    </td>
                    <td className="px-6 py-4">{formatPrice(Number(sub.amount ?? 0))}</td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(sub.start_date).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {new Date(sub.expires_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-6 py-4">
                      <SubStatusBadge status={sub.status} />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <SubscriptionDialog
                        companyId={sub.companies?.id}
                        trigger={
                          <Button variant="outline" size="sm" className="border-gold/20">
                            <RefreshCcw className="mr-1 size-3" /> Renovar
                          </Button>
                        }
                      />
                      {sub.status === "active" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Ban className="mr-1 size-3" /> Cancelar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Cancelar assinatura?</AlertDialogTitle>
                              <AlertDialogDescription>
                                A empresa perderá o acesso à plataforma imediatamente.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Voltar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  statusMutation.mutate({ id: sub.id, status: "canceled" })
                                }
                              >
                                Confirmar cancelamento
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function SubscriptionDialog({
  companyId,
  trigger,
}: {
  companyId?: string;
  trigger?: React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState(companyId ?? "");
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));

  const { data: companies } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => getCompanies(),
    enabled: open,
    retry: false,
  });

  const { data: pricing } = useQuery({
    queryKey: ["subscription-pricing"],
    queryFn: () => getSubscriptionPricing(),
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () =>
      upsertSubscription({
        data: { companyId: company, period, startDate: new Date(startDate).toISOString() },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscriptions"] });
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Assinatura do Plano Completo registrada.");
      setOpen(false);
    },
    onError: (err: any) => toast.error("Erro: " + err.message),
  });

  const price = pricing?.find((p) => p.period === period)?.price;
  const expires = calculateExpiry(new Date(startDate), period);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="bg-gold hover:bg-gold/90 text-gold-foreground font-bold">
            <Plus className="mr-2 size-4" /> Nova Assinatura
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assinatura — {PLAN_NAME}</DialogTitle>
          <DialogDescription>
            O plano é fixo e dá acesso completo. Escolha apenas o período; a validade é calculada
            automaticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Empresa</label>
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">Período</label>
            <Select value={period} onValueChange={(v) => setPeriod(v as BillingPeriod)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BILLING_PERIODS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {PERIOD_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">
              Data de início
            </label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="rounded-xl border border-gold/20 bg-gold/5 p-4 text-sm space-y-1">
            <p>
              Vencimento calculado:{" "}
              <strong>{expires.toLocaleDateString("pt-BR")}</strong>
            </p>
            {price !== undefined && (
              <p className="text-muted-foreground">
                Valor do período: {formatPrice(Number(price))}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            className="bg-gold hover:bg-gold/90 text-gold-foreground font-bold"
            disabled={!company || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? "Salvando..." : "Confirmar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SubStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    active: {
      label: "Ativa",
      className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
    expired: { label: "Expirada", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    canceled: {
      label: "Cancelada",
      className: "bg-destructive/10 text-destructive border-destructive/20",
    },
    suspended: { label: "Suspensa", className: "bg-muted text-muted-foreground" },
  };
  const config = configs[status] ?? configs["active"]!;
  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
