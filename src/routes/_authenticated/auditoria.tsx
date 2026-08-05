import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAuditLogs } from "@/domains/tenants/services/audit.functions";
import { Activity, User, Clock, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/auditoria")({
  component: AuditPage,
});

function AuditPage() {
  const getLogsFn = useServerFn(getAuditLogs);
  
  const { data: logs, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => getLogsFn({}),
  });

  if (isLoading) return <div className="p-8">Carregando auditoria...</div>;

  return (
    <div className="container py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-gold flex items-center gap-1 mb-2">
            <ArrowLeft className="size-3" /> Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Log de Auditoria</h1>
          <p className="text-muted-foreground">Rastreie alterações críticas e acessos no Laugh One.</p>
        </div>
        <Activity className="size-12 text-gold/20" />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold">Ação</th>
              <th className="px-4 py-3 font-semibold">Usuário</th>
              <th className="px-4 py-3 font-semibold">Data / Hora</th>
              <th className="px-4 py-3 font-semibold">Entidade</th>
              <th className="px-4 py-3 font-semibold">Request ID</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {logs?.map((log: any) => (
              <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gold/10 text-gold capitalize">
                    {log.action.replace(/_/g, " ")}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <User className="size-3 text-muted-foreground" />
                    <span>{log.profiles?.full_name || "Sistema"}</span>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="size-3" />
                    {format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-muted-foreground">{log.entity_type}</span>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-muted-foreground">
                  {log.request_id || "-"}
                </td>
              </tr>
            ))}
            {logs?.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
