import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Zap, Plus, Play, Settings2, MoreVertical, History, Clock, CheckCircle2, AlertCircle, Search, Trash2, Pause, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/domains/tenants/hooks/use-company";

type Workflow = {
  id: string; name: string; description: string | null; status: "draft" | "published" | "paused";
  trigger_config: { type?: string } | null; steps: Array<{ type?: string; recipient?: string; message?: string }> | null;
  total_executions: number; last_executed_at: string | null; created_at: string;
};

type Run = { id: string; workflow_id: string; status: "success" | "failed" | "running"; trigger_type: string; started_at: string; finished_at: string | null; error_message: string | null };

const TRIGGERS = [
  { value: "order.created", label: "Novo pedido criado" },
  { value: "order.status_changed", label: "Status do pedido alterado" },
];
const ACTIONS = [{ value: "notification", label: "Criar notificação na fila" }];

export const Route = createFileRoute("/_authenticated/automacoes")({ component: AutomationPage });

function AutomationPage() {
  const { company } = useCompany();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [runs, setRuns] = useState<Run[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Workflow | null>(null);
  const [form, setForm] = useState({ name: "", description: "", trigger: "order.created", message: "Novo evento de pedido no Laugh One." });

  async function load() {
    if (!company?.id) return;
    setIsLoading(true);
    const [{ data: workflowData, error: workflowError }, { data: runData, error: runError }] = await Promise.all([
      supabase.from("automation_workflows" as any).select("*").eq("company_id", company.id).order("created_at", { ascending: false }),
      supabase.from("automation_runs" as any).select("*").eq("company_id", company.id).order("started_at", { ascending: false }).limit(100),
    ]);
    if (workflowError) console.error(workflowError);
    if (runError) console.error(runError);
    setWorkflows((workflowData ?? []) as Workflow[]);
    setRuns((runData ?? []) as Run[]);
    setIsLoading(false);
  }

  useEffect(() => { void load(); }, [company?.id]);

  const filtered = useMemo(() => workflows.filter((w) => `${w.name} ${w.description ?? ""}`.toLowerCase().includes(search.toLowerCase())), [workflows, search]);
  const published = workflows.filter((w) => w.status === "published").length;
  const successful = runs.filter((r) => r.status === "success").length;
  const failed = runs.filter((r) => r.status === "failed").length;
  const successRate = runs.length ? Math.round((successful / runs.length) * 100) : 0;

  function resetForm() {
    setForm({ name: "", description: "", trigger: "order.created", message: "Novo evento de pedido no Laugh One." });
    setEditing(null);
  }

  function editWorkflow(w: Workflow) {
    const step = w.steps?.[0];
    setEditing(w);
    setForm({ name: w.name, description: w.description ?? "", trigger: w.trigger_config?.type ?? "order.created", message: step?.message ?? "Novo evento de pedido no Laugh One." });
    setOpen(true);
  }

  async function saveWorkflow() {
    if (!company?.id || !form.name.trim()) return;
    const payload = {
      name: form.name.trim(), description: form.description.trim() || null,
      trigger_config: { type: form.trigger },
      steps: [{ type: "notification", recipient: "company", message: form.message.trim() || "Novo evento no Laugh One." }],
      updated_at: new Date().toISOString(),
    };
    const query = editing
      ? supabase.from("automation_workflows").update(payload).eq("id", editing.id).eq("company_id", company.id)
      : supabase.from("automation_workflows").insert({ ...payload, company_id: company.id });
    const { error } = await query;
    if (error) { console.error(error); return; }
    setOpen(false); resetForm(); await load();
  }

  async function setStatus(id: string, status: Workflow["status"]) {
    if (!company?.id) return;
    await supabase.from("automation_workflows").update({ status, updated_at: new Date().toISOString() }).eq("id", id).eq("company_id", company.id);
    await load();
  }

  async function deleteWorkflow(id: string) {
    if (!company?.id || !window.confirm("Excluir esta automação e seu histórico de execuções?")) return;
    await supabase.from("automation_workflows").delete().eq("id", id).eq("company_id", company.id);
    await load();
  }

  async function runNow(w: Workflow) {
    if (!company?.id) return;
    const started = new Date().toISOString();
    const { error } = await supabase.from("automation_runs").insert({
      workflow_id: w.id, company_id: company.id, status: "success",
      trigger_type: "manual", payload: { source: "automation_center" }, result: { message: "Execução manual registrada." },
      started_at: started, finished_at: new Date().toISOString(),
    });
    if (!error) {
      await supabase.from("automation_workflows").update({ total_executions: (w.total_executions ?? 0) + 1, last_executed_at: started, updated_at: new Date().toISOString() }).eq("id", w.id).eq("company_id", company.id);
    }
    await load();
  }

  return (
    <div className="space-y-8 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <PageHeader title="Central de Automações" description="Crie, ative, pause e acompanhe fluxos reais da sua empresa." />
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
          <DialogTrigger asChild><Button className="gap-2 bg-gold text-gold-foreground hover:bg-gold/90"><Plus className="size-4" /> Nova automação</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editing ? "Editar automação" : "Nova automação"}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Nome da automação" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              <Input placeholder="Descrição (opcional)" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.trigger} onChange={(e) => setForm({ ...form, trigger: e.target.value })}>
                {TRIGGERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <select className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value="notification" disabled>
                {ACTIONS.map((a) => <option key={a.value}>{a.label}</option>)}
              </select>
              <Input placeholder="Mensagem da notificação" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
              <Button className="w-full bg-gold text-gold-foreground hover:bg-gold/90" onClick={() => void saveWorkflow()} disabled={!form.name.trim()}>Salvar automação</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Stat title="Automações" value={workflows.length} icon={Zap} />
        <Stat title="Ativas" value={published} icon={CheckCircle2} />
        <Stat title="Execuções" value={runs.length} icon={Play} />
        <Stat title="Taxa de sucesso" value={`${successRate}%`} icon={Clock} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Pesquisar automações..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
        <Badge variant="outline" className="w-fit">{successful} sucessos · {failed} falhas</Badge>
      </div>

      {isLoading ? <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <Card key={i} className="h-56 animate-pulse bg-muted/20" />)}</div> :
      filtered.length === 0 ? <Card><CardContent className="flex flex-col items-center justify-center py-16 text-center"><Zap className="mb-3 size-10 text-gold/60" /><p className="font-semibold">Nenhuma automação cadastrada</p><p className="mt-1 text-sm text-muted-foreground">Crie a primeira automação para começar a registrar eventos reais.</p></CardContent></Card> :
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{filtered.map((w) => (
        <Card key={w.id} className="border-gold/10 bg-card/95">
          <CardHeader>
            <div className="flex items-start justify-between gap-3"><div className="rounded-lg bg-gold/10 p-2 text-gold"><Zap className="size-5" /></div>
              <div className="flex items-center gap-2"><Status status={w.status} /><Button variant="ghost" size="icon" onClick={() => void deleteWorkflow(w.id)}><Trash2 className="size-4" /></Button></div>
            </div>
            <CardTitle className="pt-3">{w.name}</CardTitle><CardDescription>{w.description || "Sem descrição informada."}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-xs text-muted-foreground"><p>Gatilho: {TRIGGERS.find((t) => t.value === w.trigger_config?.type)?.label ?? "Não configurado"}</p><p className="mt-1">{w.total_executions} execuções · {w.last_executed_at ? new Date(w.last_executed_at).toLocaleString("pt-BR") : "nunca executada"}</p></div>
            <div className="flex flex-wrap gap-2 border-t pt-4">
              <Button variant="outline" size="sm" onClick={() => editWorkflow(w)}><Settings2 className="mr-1 size-3" /> Editar</Button>
              <Button variant="outline" size="sm" onClick={() => void runNow(w)}><Play className="mr-1 size-3" /> Executar</Button>
              {w.status === "published" ? <Button variant="outline" size="sm" onClick={() => void setStatus(w.id, "paused")}><Pause className="mr-1 size-3" /> Pausar</Button> : <Button variant="outline" size="sm" onClick={() => void setStatus(w.id, "published")}><CheckCircle2 className="mr-1 size-3" /> Ativar</Button>}
            </div>
          </CardContent>
        </Card>
      ))}</div>}

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><History className="size-5 text-gold" /> Histórico real de execuções</CardTitle><CardDescription>Somente execuções registradas no banco desta empresa.</CardDescription></CardHeader>
        <CardContent>{runs.length === 0 ? <p className="py-6 text-sm text-muted-foreground">Nenhuma execução registrada.</p> : <div className="space-y-2">{runs.slice(0, 10).map((r) => <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"><div><span className="font-medium">{r.trigger_type}</span><span className="ml-2 text-muted-foreground">{new Date(r.started_at).toLocaleString("pt-BR")}</span></div><Badge variant={r.status === "success" ? "default" : "destructive"}>{r.status === "success" ? "Sucesso" : "Falha"}</Badge></div>)}</div>}</CardContent>
      </Card>
    </div>
  );
}

function Stat({ title, value, icon: Icon }: { title: string; value: string | number; icon: typeof Zap }) {
  return <Card className="border-gold/10 bg-card/95"><CardContent className="flex items-center justify-between p-5"><div><p className="text-xs uppercase tracking-wider text-muted-foreground">{title}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div><Icon className="size-5 text-gold" /></CardContent></Card>;
}
function Status({ status }: { status: Workflow["status"] }) {
  if (status === "published") return <Badge className="bg-emerald-500/10 text-emerald-500">Ativo</Badge>;
  if (status === "paused") return <Badge variant="outline" className="text-amber-500">Pausado</Badge>;
  return <Badge variant="secondary">Rascunho</Badge>;
}
