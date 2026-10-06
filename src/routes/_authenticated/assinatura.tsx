import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, CreditCard, Crown, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getMySubscription, getSubscriptionPricing } from "@/domains/tenants/subscriptions/subscriptions.functions";
import { formatPrice, PERIOD_LABELS, PLAN_NAME, type BillingPeriod } from "@/domains/tenants/subscriptions/types";

export const Route = createFileRoute("/assinatura")({
  component: SubscriptionPage,
});

function SubscriptionPage() {
  const getSubscription = useServerFn(getMySubscription);
  const getPricing = useServerFn(getSubscriptionPricing);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => getSubscription(),
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const { data: pricing } = useQuery({
    queryKey: ["subscription-pricing"],
    queryFn: () => getPricing(),
    staleTime: 300_000,
  });

  if (isLoading) return <div className="p-8 text-muted-foreground">Carregando sua assinatura...</div>;

  const expiresAt = subscription?.expires_at ? new Date(subscription.expires_at) : null;
  const daysRemaining = expiresAt
    ? Math.max(0, Math.ceil((expiresAt.getTime() - Date.now()) / 86_400_000))
    : 0;
  const isTrial = Number(subscription?.amount ?? 0) === 0 && daysRemaining > 0;
  const isExpired = !expiresAt || daysRemaining === 0 || subscription?.status !== "active";

  return (
    <div className="container max-w-6xl py-8 space-y-8 animate-in fade-in duration-500">
      <PageHeader
        title="Minha assinatura"
        description="Acompanhe seu plano, validade e as opções comerciais disponíveis para sua empresa."
      />

      {!subscription ? (
        <Card className="border-gold/20">
          <CardContent className="p-8 text-center space-y-3">
            <CreditCard className="mx-auto size-10 text-gold/60" />
            <h2 className="text-xl font-semibold">Nenhuma assinatura encontrada</h2>
            <p className="text-sm text-muted-foreground">
              Sua conta ainda não possui uma assinatura vinculada. Se o cadastro acabou de ser feito,
              atualize a página em alguns segundos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            <SummaryCard icon={Crown} label="Plano" value={subscription.plan_name || PLAN_NAME} />
            <SummaryCard
              icon={CalendarClock}
              label="Período"
              value={PERIOD_LABELS[subscription.billing_period as BillingPeriod] ?? subscription.billing_period}
            />
            <SummaryCard
              icon={CalendarClock}
              label={isTrial ? "Teste restante" : "Validade"}
              value={isTrial ? `${daysRemaining} ${daysRemaining === 1 ? "dia" : "dias"}` : expiresAt?.toLocaleDateString("pt-BR") ?? "—"}
            />
            <SummaryCard icon={ShieldCheck} label="Status" value={statusLabel(subscription.status, isTrial)} />
          </div>

          <Card className={isExpired ? "border-destructive/30" : "border-gold/20"}>
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="size-5 text-gold" />
                    {subscription.plan_name || PLAN_NAME}
                  </CardTitle>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isTrial
                      ? "Você está no período inicial de teste. Nenhum pagamento foi cobrado."
                      : "Plano completo da Laugh One para gestão da sua operação."}
                  </p>
                </div>
                <Badge variant="outline" className={isExpired ? "border-destructive/30 text-destructive" : "border-gold/30 text-gold"}>
                  {statusLabel(subscription.status, isTrial)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <Info label="Início" value={new Date(subscription.start_date).toLocaleDateString("pt-BR")} />
              <Info label="Vencimento" value={expiresAt?.toLocaleDateString("pt-BR") ?? "—"} />
              <Info label="Valor atual" value={formatPrice(Number(subscription.amount ?? 0))} />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Opções de contratação</h2>
              <p className="text-sm text-muted-foreground">
                O Laugh One mantém um plano completo; o período altera apenas a duração e o valor contratado.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {(pricing ?? []).map((item) => (
                <Card key={item.period} className="border-gold/10 transition-all hover:border-gold/30 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-base">{item.label || PERIOD_LABELS[item.period as BillingPeriod]}</CardTitle>
                    <p className="text-2xl font-bold">{formatPrice(Number(item.price))}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {item.months} {item.months === 1 ? "mês" : "meses"} de acesso ao {PLAN_NAME}.
                    </p>
                    {Number(item.savings_percent ?? 0) > 0 && (
                      <Badge variant="secondary">Economia de {Number(item.savings_percent)}%</Badge>
                    )}
                    <p className="text-xs text-muted-foreground">
                      A contratação/renovação será habilitada quando o meio de pagamento estiver conectado.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value }: { icon: typeof Crown; label: string; value: string }) {
  return (
    <Card className="border-gold/10">
      <CardContent className="p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gold/10 p-2.5 text-gold"><Icon className="size-5" /></div>
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="truncate text-lg font-semibold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium">{value}</p>
    </div>
  );
}

function statusLabel(status: string, trial: boolean) {
  if (trial) return "Em teste";
  if (status === "active") return "Ativa";
  if (status === "expired") return "Expirada";
  if (status === "canceled") return "Cancelada";
  if (status === "suspended") return "Suspensa";
  return status;
}
