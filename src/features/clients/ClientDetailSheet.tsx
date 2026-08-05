import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import {
  getClient,
  updateClient,
} from "./clients.functions";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  History,
  Package,
  Pencil,
} from "lucide-react";
import { ClientForm } from "./ClientForm";
import { formatBRL, formatDate } from "@/lib/format";
import type { ClientPayload } from "./schemas";
import { STATUS_LABEL, STATUS_TONE, type OrderStatus } from "@/features/orders/schemas";

interface Props {
  clientId: string | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

const operationLabel: Record<string, string> = {
  INSERT: "Criado",
  UPDATE: "Atualizado",
  DELETE: "Removido",
};

export function ClientDetailSheet({ clientId, open, onOpenChange }: Props) {
  const qc = useQueryClient();
  const getFn = useServerFn(getClient);
  const updateFn = useServerFn(updateClient);

  const [editing, setEditing] = useState(false);

  const query = useQuery({
    queryKey: ["client", clientId],
    queryFn: () => getFn({ data: { id: clientId! } }),
    enabled: !!clientId && open,
  });

  const updateMut = useMutation({
    mutationFn: (v: ClientPayload) => updateFn({ data: { id: clientId!, ...v } as never }),
    onSuccess: () => {
      toast.success("Cliente atualizado");
      setEditing(false);
      qc.invalidateQueries({ queryKey: ["client", clientId] });
      qc.invalidateQueries({ queryKey: ["clients"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const client = query.data?.client;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle className="font-display text-2xl">
            {query.isLoading ? "Carregando..." : client?.name ?? "Cliente"}
          </SheetTitle>
        </SheetHeader>

        {query.isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="size-6 animate-spin text-gold" />
          </div>
        ) : client ? (
          <Tabs defaultValue="info" className="mt-6">
            <TabsList className="w-full">
              <TabsTrigger value="info" className="flex-1">Dados</TabsTrigger>
              <TabsTrigger value="orders" className="flex-1">
                <Package className="mr-1 size-3.5" /> Pedidos ({(query.data as any)?.orders?.length ?? 0})
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                <History className="mr-1 size-3.5" /> Histórico
              </TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="mt-4">
              {editing ? (
                <ClientForm
                  defaultValues={{
                    name: client.name,
                    cpf: client.cpf ?? "",
                    phone: client.phone ?? "",
                    whatsapp: client.whatsapp ?? "",
                    instagram: client.instagram ?? "",
                    zip: client.zip ?? "",
                    street: client.street ?? "",
                    number: client.number ?? "",
                    complement: client.complement ?? "",
                    district: client.district ?? "",
                    reference: client.reference ?? "",
                    city: client.city ?? "",
                    state: client.state ?? "",
                    notes: client.notes ?? "",
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
                    <Info label="CPF" value={client.cpf} />
                    <Info label="Telefone" value={client.phone} />
                    <Info label="WhatsApp" value={client.whatsapp} />
                    <Info label="Instagram" value={client.instagram ? `@${client.instagram}` : null} />
                    <Info label="CEP" value={client.zip} />
                    <Info
                      label="Endereço"
                      value={[client.street, client.number, client.complement].filter(Boolean).join(", ") || null}
                    />
                    <Info label="Bairro" value={client.district} />
                    <Info label="Referência" value={client.reference} />
                    <Info label="Cidade" value={client.city} />
                    <Info label="UF" value={client.state} />
                    <Info label="Criado em" value={formatDate(client.created_at)} />
                    <Info label="Atualizado em" value={formatDate(client.updated_at)} />
                  </dl>
                  {client.notes ? (
                    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Observações</p>
                      <p className="mt-1 whitespace-pre-wrap">{client.notes}</p>
                    </div>
                  ) : null}
                </div>
              )}
            </TabsContent>

            <TabsContent value="orders" className="mt-4">
              {(query.data as any)?.orders?.length ? (
                <ul className="divide-y divide-border rounded-lg border border-border">
                  {(query.data as any).orders.map((o: any) => {
                    const label = STATUS_LABEL[o.status as OrderStatus] ?? o.status;
                    const tone = STATUS_TONE[o.status as OrderStatus] ?? "";
                    const desc = [o.brand, o.model].filter(Boolean).join(" ") || "Relógio";
                    return (
                      <li key={o.id} className="flex items-center gap-3 p-3 text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{desc}</p>
                          <p className="text-xs text-muted-foreground">
                            Pedido #{o.order_number ?? "—"} · {formatDate(o.created_at)}
                            {o.quantity && o.quantity > 1 ? ` · Qtd ${o.quantity}` : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatBRL(o.sale_price)}</p>
                          <Badge className={`text-[10px] ${tone}`}>{label}</Badge>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum pedido registrado.</p>
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4">
              {(query.data as any)?.history?.length ? (
                <ol className="space-y-2">
                  {(query.data as any).history.map((h: any) => (
                    <li key={h.id} className="flex gap-3 rounded-lg border border-border bg-card/40 p-3 text-sm">
                      <Badge variant="outline" className="h-fit">{operationLabel[h.operation] ?? h.operation}</Badge>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-muted-foreground">{formatDate(h.changed_at)}</p>
                        {h.operation === "UPDATE" && h.old_data && h.new_data ? (
                          <ul className="mt-1 space-y-0.5 text-xs">
                            {diffFields(h.old_data as Record<string, unknown>, h.new_data as Record<string, unknown>).map((d) => (
                              <li key={d.field}>
                                <span className="font-medium">{d.field}:</span>{" "}
                                <span className="text-muted-foreground line-through">{String(d.old ?? "—")}</span>{" "}
                                → <span className="text-gold">{String(d.new ?? "—")}</span>
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">Sem histórico.</p>
              )}
            </TabsContent>
          </Tabs>
        ) : null}
      </SheetContent>
    </Sheet>
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

const IGNORE = new Set(["updated_at", "created_at", "id", "created_by", "deleted_at"]);
function diffFields(oldD: Record<string, unknown>, newD: Record<string, unknown>) {
  const out: Array<{ field: string; old: unknown; new: unknown }> = [];
  const keys = new Set([...Object.keys(oldD), ...Object.keys(newD)]);
  for (const k of keys) {
    if (IGNORE.has(k)) continue;
    if (JSON.stringify(oldD[k]) !== JSON.stringify(newD[k])) {
      out.push({ field: k, old: oldD[k], new: newD[k] });
    }
  }
  return out;
}
