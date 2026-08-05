import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCompanyHistory, restoreCompanyField } from "@/domains/tenants/services/settings.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { History, Search, Filter, RefreshCcw, User, Calendar, Tag, ChevronRight, Clock } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/historico")({
  component: HistoryPage,
});

function HistoryPage() {
  const getHistory = useServerFn(getCompanyHistory);
  const restoreField = useServerFn(restoreCompanyField);
  const queryClient = useQueryClient();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");

  const { data: history, isLoading } = useQuery({
    queryKey: ["company-history"],
    queryFn: () => getHistory({}),
  });

  const mutation = useMutation({
    mutationFn: (logId: string) => restoreField({ data: { logId } }),
    onSuccess: () => {
      toast.success("Versão anterior restaurada com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["company-history"] });
      queryClient.invalidateQueries({ queryKey: ["company-settings"] });
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="p-8">Carregando histórico...</div>;

  const filteredHistory = history?.filter((log: any) => {
    const matchesSearch = log.field_changed?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         log.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  return (
    <div className="container max-w-6xl py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Histórico de Alterações</h1>
          <p className="text-muted-foreground">Rastreabilidade completa de todas as mudanças realizadas no Laugh One.</p>
        </div>
        <History className="size-12 text-gold/20" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="p-6 border-gold/10 bg-card/50 backdrop-blur-sm space-y-6">
            <h3 className="font-semibold flex items-center gap-2">
              <Filter className="size-4 text-gold" /> Filtros
            </h3>
            
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Busca</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input 
                  placeholder="Campo ou descrição..." 
                  className="pl-9 bg-background/50 border-gold/20" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase">Módulo</label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="bg-background/50 border-gold/20">
                  <SelectValue placeholder="Todos os módulos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="company">Empresa</SelectItem>
                  <SelectItem value="client">Clientes</SelectItem>
                  <SelectItem value="order">Pedidos</SelectItem>
                  <SelectItem value="product">Produtos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        <div className="md:col-span-3">
          {filteredHistory && filteredHistory.length > 0 ? (
            <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gold/50 before:via-gold/20 before:to-transparent">
              {filteredHistory.map((log: any) => (
                <div key={log.id} className="relative flex items-start gap-6 group">
                  <div className="absolute left-0 mt-1 size-10 rounded-full border-4 border-background bg-gold flex items-center justify-center shadow-lg shadow-gold/20 z-10 group-hover:scale-110 transition-transform">
                    {log.action_type === 'RESTORE' ? <RefreshCcw className="size-5 text-black" /> : <Clock className="size-5 text-black" />}
                  </div>
                  
                  <Card className="flex-1 ml-4 p-6 border-gold/10 bg-card/50 backdrop-blur-sm group-hover:border-gold/30 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-gold/10 text-gold border-gold/20 uppercase text-[10px]">
                            {log.module}
                          </Badge>
                          <span className="text-sm font-bold text-gold">
                            {log.action_type}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold">{log.description}</h4>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                          <Calendar className="size-3" />
                          {format(new Date(log.created_at), "dd 'de' MMMM 'às' HH:mm", { locale: ptBR })}
                        </div>
                        <div className="flex items-center justify-end gap-2 text-xs text-gold mt-1">
                          <User className="size-3" />
                          {log.profiles?.full_name || 'Sistema'}
                        </div>
                      </div>
                    </div>

                    {log.field_changed && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-background/30 border border-gold/5">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Valor Anterior</span>
                          <p className="text-sm text-destructive line-through opacity-70 break-all">{log.old_value || '(Vazio)'}</p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-emerald-500 uppercase font-bold tracking-wider">Novo Valor</span>
                          <p className="text-sm text-emerald-500 font-medium break-all">{log.new_value || '(Vazio)'}</p>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground italic">
                        Campo: <span className="text-gold not-italic font-mono">{log.field_changed || 'N/A'}</span>
                      </span>
                      {log.action_type === 'UPDATE' && log.old_value && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-xs text-gold hover:bg-gold/10 gap-2"
                          onClick={() => mutation.mutate(log.id)}
                          disabled={mutation.isPending}
                        >
                          <RefreshCcw className={`size-3 ${mutation.isPending ? 'animate-spin' : ''}`} />
                          Restaurar Versão
                        </Button>
                      )}
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-12 border-dashed border-gold/20 bg-card/20 text-center flex flex-col items-center gap-4">
              <History className="size-12 text-muted-foreground opacity-20" />
              <div className="space-y-1">
                <p className="text-lg font-medium">Nenhum registro encontrado</p>
                <p className="text-sm text-muted-foreground">Tente ajustar seus filtros ou busca.</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
