import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Plus, 
  Play, 
  Settings2, 
  MoreVertical, 
  History, 
  Clock, 
  CheckCircle2,
  AlertCircle,
  Search,
  ArrowRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useCompany } from "@/hooks/use-company";

export const Route = createFileRoute("/_authenticated/automacoes")({
  component: AutomationPage,
});

function AutomationPage() {
  const { company } = useCompany();
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (company?.id) {
      loadWorkflows();
    }
  }, [company?.id]);

  async function loadWorkflows() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("automation_workflows" as any)
        .select("*")
        .eq("company_id", company?.id)
        .order("created_at", { ascending: false });

      if (data) setWorkflows(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published': return <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Ativo</Badge>;
      case 'paused': return <Badge variant="outline" className="bg-amber-500/10 text-amber-500">Pausado</Badge>;
      default: return <Badge variant="secondary">Rascunho</Badge>;
    }
  };

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <PageHeader
          title="Central de Automações"
          description="Automatize processos, integrações e fluxos de trabalho inteligentes sem código."
        />
        <Button className="gap-2 bg-gold hover:bg-gold/90 text-gold-foreground">
          <Plus className="size-4" /> Nova Automação
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-500" />
              Execuções com Sucesso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">1,284</div>
            <p className="text-xs text-muted-foreground mt-1">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="size-4 text-red-500" />
              Falhas Registradas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-red-500">2</div>
            <p className="text-xs text-muted-foreground mt-1">Nível crítico: Baixo</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="size-4 text-blue-500" />
              Tempo Médio de Economia
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">42h</div>
            <p className="text-xs text-muted-foreground mt-1">Horas salvas este mês</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Pesquisar automações..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2">
            <History className="size-4" /> Histórico Global
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* New Automation Template Card */}
        <Card className="border-dashed flex flex-col items-center justify-center p-8 text-center bg-muted/20 hover:bg-muted/30 transition-colors cursor-pointer group">
          <div className="size-12 rounded-full bg-gold/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Zap className="size-6 text-gold" />
          </div>
          <CardTitle className="text-lg mb-2">Criar do Zero</CardTitle>
          <CardDescription>
            Defina gatilhos, condições e ações personalizadas.
          </CardDescription>
        </Card>

        {isLoading ? (
          Array(2).fill(0).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-muted rounded-xl" />
            </Card>
          ))
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id} className="group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-lg bg-gold/5 flex items-center justify-center border border-gold/10">
                    <Zap className="size-5 text-gold" />
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(workflow.status)}
                    <Button variant="ghost" size="icon" className="size-8">
                      <MoreVertical className="size-4" />
                    </Button>
                  </div>
                </div>
                <div className="mt-4">
                  <CardTitle className="text-xl group-hover:text-gold transition-colors">{workflow.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {workflow.description || "Sem descrição informada."}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
                  <div className="flex items-center gap-1">
                    <Play className="size-3" />
                    <span>{workflow.total_executions} execuções</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <History className="size-3" />
                    <span>há 2 horas</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <Button variant="ghost" size="sm" className="text-xs gap-2">
                    <Settings2 className="size-3" /> Configurar
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs gap-2 group/btn">
                    Ver Fluxo <ArrowRight className="size-3 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Templates Section */}
      <div className="pt-8">
        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="size-5 text-gold" />
          Templates Recomendados
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Boas-vindas", desc: "Envie e-mail e WhatsApp para novos clientes." },
            { title: "Cobrança Automática", desc: "Avise 3 dias antes do vencimento." },
            { title: "Lead Scoring IA", desc: "Classifique leads usando Inteligência Artificial." },
            { title: "Sincronização ERP", desc: "Integre vendas com seu sistema contábil." }
          ].map((template, i) => (
            <Card key={i} className="bg-muted/10 border-gold/5 hover:border-gold/20 transition-all cursor-pointer">
              <CardHeader className="p-5">
                <CardTitle className="text-sm">{template.title}</CardTitle>
                <CardDescription className="text-xs line-clamp-2">{template.desc}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { Sparkles } from "lucide-react";
