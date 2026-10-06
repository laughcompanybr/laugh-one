import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getOrder,
  updateOrder,
  changeOrderStatus,
  addMixedPayments,
  deletePayment,
} from "./orders.functions";
import { getCardFeePercent } from "@/features/settings/settings.functions";
import {
  ORDER_STATUS,
  STATUS_LABEL,
  STATUS_TONE,
  PAYMENT_METHODS,
  type OrderPayload,
  type PaymentMethod,
} from "./schemas";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Activity,
  Wallet,
  Truck,
  Pencil,
  Trash2,
  Plus,
  ArrowDownCircle,
  ArrowUpCircle,
  Package,
} from "lucide-react";
import { OrderForm } from "./OrderForm";
import { formatBRL, formatDate } from "@/lib/format";

interface Props {
  orderId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function OrderDetailSheet({ orderId, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const getFn = useServerFn(getOrder);
  const updateFn = useServerFn(updateOrder);
  const statusFn = useServerFn(changeOrderStatus);
  const addMixedFn = useServerFn(addMixedPayments);
  const delPayFn = useServerFn(deletePayment);
  const cardFeeFn = useServerFn(getCardFeePercent);

  const [editing, setEditing] = useState(false);

  const query = useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getFn({ data: { id: orderId! } }),
    enabled: !!orderId && open,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["order", orderId] });
    qc.invalidateQueries({ queryKey: ["orders"] });
  };

  const updateMut = useMutation({
    mutationFn: (v: OrderPayload) => updateFn({ data: { id: orderId!, ...v } as never }),
    onSuccess: () => { toast.success("Pedido atualizado"); setEditing(false); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusMut = useMutation({
    mutationFn: (status: (typeof ORDER_STATUS)[number]) => statusFn({ data: { id: orderId!, status } }),
    onSuccess: () => { toast.success("Status atualizado"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const cardFeeQ = useQuery({ queryKey: ["settings", "card-fee-percent"], queryFn: () => cardFeeFn(), staleTime: 5 * 60_000 });

  const addMixedMut = useMutation({
    mutationFn: (v: { entries: MixedEntry[]; expected_total: number }) =>
      addMixedFn({
        data: {
          order_id: orderId!,
          expected_total: v.expected_total,
          entries: v.entries.map((e) => ({
            direction: e.direction,
            amount: e.amount,
            method: e.method,
            installments: e.installments ?? null,
            card_fee: e.card_fee,
            card_fee_percent: e.card_fee_percent ?? null,
            paid_at: e.paid_at,
            notes: e.notes ?? "",
          })),
        } as never,
      }),
    onSuccess: (r: any) => { toast.success(`${r.count} pagamento(s) registrado(s)`); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const delPayMut = useMutation({
    mutationFn: (id: string) => delPayFn({ data: { id } }),
    onSuccess: () => { toast.success("Pagamento removido"); invalidate(); },
    onError: (e: Error) => toast.error(e.message),
  });

  const order = (query.data as any)?.order;
  const client = order?.clients;
  const totals = (query.data as any)?.totals;
  const isOverdue = !!order?.expected_delivery && !["cancelled", "delivered"].includes(order.status) && new Date(order.expected_delivery) < new Date();
  const currentStatusIndex = order ? ORDER_STATUS.indexOf(order.status) : -1;
  const nextStatus = currentStatusIndex >= 0 && currentStatusIndex < ORDER_STATUS.length - 1 ? ORDER_STATUS[currentStatusIndex + 1] : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-3xl">
        <SheetHeader>
          <div className="flex items-center gap-3">
            <SheetTitle className="font-display text-2xl">
              {query.isLoading ? "Carregando..." : `Pedido #${order?.order_number ?? "—"}`}
            </SheetTitle>
            {order ? (
              <Badge className={(STATUS_TONE as any)[order.status]}>{(STATUS_LABEL as any)[order.status]}</Badge>
            ) : null}
          </div>
          {order ? (
            <p className="text-sm text-muted-foreground">
              {[order.brand, order.model].filter(Boolean).join(" ") || "Sem descrição"} · {client?.name ?? "Sem cliente"}
            </p>
          ) : null}
        </SheetHeader>

        {query.isLoading ? (
          <div className="flex justify-center py-16"><Loader2 className="size-6 animate-spin text-gold" /></div>
        ) : order && totals ? (
          <>
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatBox label="Venda" value={formatBRL(order.sale_price)} />
              <StatBox label="Custo" value={formatBRL(order.cost_price)} />
              <StatBox label="Lucro" value={formatBRL(totals.profit)} tone={totals.profit >= 0 ? "positive" : "negative"} />
              <StatBox label="Saldo a receber" value={formatBRL(totals.balance)} tone={totals.balance > 0 ? "warning" : "positive"} />
            </div>

            {isOverdue ? (
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-amber-600 dark:text-amber-400">\n                <AlertTriangle className="size-5 shrink-0" />\n                <div className="min-w-0 flex-1">\n                  <p className="text-sm font-semibold">Entrega em atraso</p>\n                  <p className="text-xs opacity-80">Previsão: {formatDate(order.expected_delivery)}. Atualize o status ou a previsão para manter o pedido operacional.</p>\n                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card/40 p-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
              <Select value={order.status} onValueChange={(v) => statusMut.mutate(v as (typeof ORDER_STATUS)[number])}>
                <SelectTrigger className="max-w-[220px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORDER_STATUS.map((s) => <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="info" className="mt-6">
              <TabsList className="w-full">
                <TabsTrigger value="info" className="flex-1">Dados</TabsTrigger>
                <TabsTrigger value="payments" className="flex-1">
                  <Wallet className="mr-1 size-3.5" /> Pagamentos ({(query.data as any)?.payments?.length ?? 0})
                </TabsTrigger>
                <TabsTrigger value="tracking" className="flex-1">
                  <Truck className="mr-1 size-3.5" /> Rastreio
                </TabsTrigger>
                <TabsTrigger value="timeline" className="flex-1">
                  <Activity className="mr-1 size-3.5" /> Timeline
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="mt-4">
                {editing ? (
                  <OrderForm
                    defaultValues={{
                      client_id: order.client_id ?? "",
                      supplier_id: order.supplier_id ?? "",
                      brand: order.brand ?? "",
                      model: order.model ?? "",
                      reference: order.reference ?? "",
                      quantity: order.quantity ?? 1,
                      sale_price: order.sale_price,
                      cost_price: order.cost_price,
                      commission: order.commission ?? 0,
                      card_fee: order.card_fee ?? 0,
                      shipping: order.shipping ?? 0,
                      other_costs: order.other_costs ?? 0,
                      amount_received: order.amount_received,
                      payment_method: order.payment_method ?? "",
                      purchase_date: order.purchase_date ?? "",
                      expected_delivery: order.expected_delivery ?? "",
                      tracking_code: order.tracking_code ?? "",
                      status: order.status,
                      ship_zip: order.ship_zip ?? "",
                      ship_street: order.ship_street ?? "",
                      ship_number: order.ship_number ?? "",
                      ship_complement: order.ship_complement ?? "",
                      ship_district: order.ship_district ?? "",
                      ship_city: order.ship_city ?? "",
                      ship_state: order.ship_state ?? "",
                      ship_reference: order.ship_reference ?? "",
                      notes: order.notes ?? "",
                    }}
                    submitLabel="Salvar alterações"
                    onSubmit={async (v) => { await updateMut.mutateAsync(v); }}
                    onCancel={() => setEditing(false)}
                  />

                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-end">
                      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                        <Pencil className="mr-2 size-3.5" /> Editar
                      </Button>
                    </div>

                    <dl className="grid grid-cols-2 gap-4 text-sm">
                      <Info label="Cliente" value={client?.name} />
                      <Info label="Marca" value={order.brand} />
                      <Info label="Modelo" value={order.model} />
                      <Info label="Referência" value={order.reference} />
                      <Info label="Quantidade" value={String(order.quantity ?? 1)} />
                      <Info label="Data da compra" value={formatDate(order.purchase_date)} />
                      <Info label="Previsão de entrega" value={formatDate(order.expected_delivery)} />
                      <Info label="Criado em" value={formatDate(order.created_at)} />
                    </dl>

                    <div className="rounded-xl border border-border bg-card/40 p-4">
                      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">Resumo financeiro</p>
                      <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                        <Info label="Total venda" value={formatBRL(totals.totalSale)} />
                        <Info label="Total custo" value={formatBRL(totals.totalCost)} />
                        <Info label="Comissão" value={formatBRL(order.commission)} />
                        <Info label="Lucro líquido" value={formatBRL(totals.netProfit)} />
                        <Info label="Recebido" value={formatBRL(totals.totalIn)} />
                        <Info label="Pendente" value={formatBRL(totals.balance)} />
                      </div>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="payments" className="mt-4">
                <MixedPaymentForm
                  defaultCardFeePercent={cardFeeQ.data?.percent ?? 3.49}
                  suggestedTotal={Math.max(0, totals.balance)}
                  onSubmit={async (v) => { await addMixedMut.mutateAsync(v); }}
                />
                <div className="mt-4">
                  {(query.data as any)?.payments?.length ? (
                    <ul className="divide-y divide-border rounded-lg border border-border">
                      {(query.data as any).payments.map((p: any) => (
                        <li key={p.id} className="flex items-center gap-3 p-3 text-sm">
                          {p.direction === "in" ? (
                            <ArrowDownCircle className="size-5 text-emerald-500" />
                          ) : (
                            <ArrowUpCircle className="size-5 text-destructive" />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-medium">{formatBRL(p.amount)}</p>
                            <p className="text-xs text-muted-foreground">
                              {p.method ?? "—"}
                              {p.installments ? ` · ${p.installments}x` : ""}
                              {" · "}{formatDate(p.paid_at)}
                            </p>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => { if (confirm("Remover pagamento?")) delPayMut.mutate(p.id); }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="tracking" className="mt-4">
                <div className="rounded-xl border border-border bg-card/40 p-4">
                  <Info label="Código de Rastreio" value={order.tracking_code} />
                  {order.tracking_code ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => window.open(`https://www.linkcorreios.com.br/${order.tracking_code}`, "_blank")}
                    >
                      Rastrear nos Correios <Package className="ml-2 size-3.5" />
                    </Button>
                  ) : null}
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="mt-4">
                {(query.data as any)?.events?.length ? (
                  <ol className="space-y-4">
                    {(query.data as any).events.map((e: any) => (
                      <li key={e.id} className="flex gap-3 text-sm">
                        <div className="mt-1 size-2 shrink-0 rounded-full bg-gold" />
                        <div>
                          <p className="font-medium">{e.message}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(e.created_at)}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : null}
              </TabsContent>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}

function StatBox({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "neutral" | "positive" | "negative" | "warning" }) {
  const tones = {
    neutral: "text-foreground",
    positive: "text-emerald-500",
    negative: "text-destructive",
    warning: "text-amber-500",
  };
  return (
    <div className="rounded-xl border border-border bg-card/40 p-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-1 font-display text-lg ${tones[tone]}`}>{value}</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-foreground">{value || "—"}</dd>
    </div>
  );
}

interface MixedEntry {
  direction: "in" | "out";
  amount: number;
  method: string;
  installments?: number;
  card_fee?: number;
  card_fee_percent?: number;
  paid_at: string;
  notes?: string;
}

function MixedPaymentForm({ defaultCardFeePercent, suggestedTotal, onSubmit }: { defaultCardFeePercent: number; suggestedTotal: number; onSubmit: (v: { entries: MixedEntry[]; expected_total: number }) => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>("PIX");
  const [amount, setAmount] = useState<string>(suggestedTotal.toFixed(2));

  const handleAdd = async () => {
    setLoading(true);
    try {
      await onSubmit({
        expected_total: 0,
        entries: [{
          direction: "in",
          amount: Number(amount),
          method,
          paid_at: new Date().toISOString(),
        }]
      });
      setAmount("0");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Método</Label>
          <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Valor</Label>
          <Input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </div>
      </div>
      <Button onClick={handleAdd} disabled={loading} className="w-full">
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Plus className="mr-2 size-4" />}
        Adicionar Pagamento
      </Button>
    </div>
  );
}
