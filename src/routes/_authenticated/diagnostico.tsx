import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getRLSDiagnostics } from "@/domains/auth/services/diagnostics.functions";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, Activity, Database, AlertCircle, CheckCircle2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const Route = createFileRoute("/_authenticated/diagnostico")({
  component: DiagnosticsPage,
});

function DiagnosticsPage() {
  const { data: diagnostics, isLoading, refetch } = useQuery({
    queryKey: ["rls-diagnostics"],
    queryFn: () => getRLSDiagnostics(),
  });

  if (isLoading) return <div className="p-8 text-center">Executando diagnósticos de RLS...</div>;

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Diagnóstico de RLS & Segurança"
        description="Monitoramento em tempo real de isolamento de tenants e recursão de políticas."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sessão Atual</CardTitle>
            <Activity className="text-blue-500 size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-mono truncate" title={diagnostics?.session.userId}>
              ID: {diagnostics?.session.userId.split('-')[0]}...
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Empresa: <span className="font-mono">{diagnostics?.session.companyId?.split('-')[0] || 'Nenhuma'}...</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status de Recursão</CardTitle>
            {diagnostics?.recursionSafe ? (
              <ShieldCheck className="text-emerald-500 size-4" />
            ) : (
              <ShieldAlert className="text-red-500 size-4" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {diagnostics?.recursionSafe ? "Seguro" : "Risco Detectado"}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {diagnostics?.recursionSafe 
                ? "Políticas sem recursão detectada."
                : "Erro de recursão ou acesso negado."}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Políticas Ativas</CardTitle>
            <Database className="text-gold size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics?.policies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Políticas de RLS em public.profiles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Registros Visíveis</CardTitle>
            <ShieldCheck className="text-emerald-500 size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{diagnostics?.visibleProfilesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Profiles acessíveis via RLS.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Acesso aos Módulos</CardTitle>
            <CardDescription>Indicadores de acesso baseados em permissões e empresa.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {diagnostics?.moduleAccess.map((m: any) => (
                <div key={m.module_slug} className="flex items-center justify-between p-2 border rounded-lg">
                  <span className="font-medium capitalize">{m.module_slug}</span>
                  {m.has_access ? (
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">
                      <CheckCircle2 className="size-3 mr-1" /> Ativo
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground">
                      <AlertCircle className="size-3 mr-1" /> Bloqueado
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalhamento das Políticas</CardTitle>
            <CardDescription>Expressões técnicas de acesso RLS.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Cmd</TableHead>
                  <TableHead>Qual</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {diagnostics?.policies.map((p: any, i: number) => (
                  <TableRow key={i}>
                    <TableCell className="font-mono text-[10px]">{p.policyname}</TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{p.cmd}</Badge></TableCell>
                    <TableCell className="font-mono text-[10px] text-muted-foreground max-w-[200px] truncate">
                      {p.qual}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
