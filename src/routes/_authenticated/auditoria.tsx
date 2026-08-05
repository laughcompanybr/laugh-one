import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { 
  Activity, 
  Search, 
  Filter, 
  Download, 
  Clock, 
  User, 
  Database, 
  AlertCircle,
  Eye
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { getAuditLogs } from "@/domains/auth/services/admin.functions";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";


export const Route = createFileRoute("/_authenticated/auditoria")({
  component: AuditPage,
});

function AuditPage() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => getAuditLogs(),
  });
  
  const [search, setSearch] = useState("");

  const filteredLogs = (logs || []).filter(log => 
    log.table_name.toLowerCase().includes(search.toLowerCase()) ||
    log.operation.toLowerCase().includes(search.toLowerCase()) ||
    log.profiles?.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getOperationColor = (op: string) => {
    switch (op) {
      case 'INSERT': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'UPDATE': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Logs de Auditoria Detalhados"
        description="Acompanhe todas as alterações de permissões, RLS e dados sensíveis."
      />

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por tabela, operação ou usuário..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Data</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Tabela</TableHead>
                  <TableHead>Operação</TableHead>
                  <TableHead>ID Registro</TableHead>
                  <TableHead className="text-right">Detalhes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">Carregando...</TableCell></TableRow>
                ) : filteredLogs.length === 0 ? (
                  <TableRow><TableCell colSpan={6} className="h-24 text-center">Nenhum log encontrado.</TableCell></TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-mono">
                        {format(new Date(log.changed_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{log.profiles?.full_name || 'Sistema'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs">{log.table_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] font-bold ${getOperationColor(log.operation)}`}>
                          {log.operation}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono text-muted-foreground">{log.record_id}</TableCell>
                      <TableCell className="text-right">
                         <AuditDetailDialog log={log} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function AuditDetailDialog({ log }: { log: any }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <Eye className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes da Operação: {log.operation}</DialogTitle>
          <DialogDescription>
            Tabela: {log.table_name} | ID: {log.record_id}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Dado Anterior</h4>
            <pre className="p-3 rounded bg-muted text-[10px] overflow-auto max-h-[400px]">
              {JSON.stringify(log.old_data, null, 2)}
            </pre>
          </div>
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase text-muted-foreground">Novo Dado</h4>
            <pre className="p-3 rounded bg-muted text-[10px] overflow-auto max-h-[400px]">
              {JSON.stringify(log.new_data, null, 2)}
            </pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

