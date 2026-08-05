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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
                ? "As políticas de profiles não apresentam recursão infinita."
                : "Erro detectado ao validar profundidade da política."}
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
              Políticas de RLS aplicadas à tabela public.profiles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Isolamento de Dados</CardTitle>
            <Activity className="text-blue-500 size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Consolidado</div>
            <p className="text-xs text-muted-foreground mt-1">
              {diagnostics?.visibleProfilesCount} registros visíveis para sua empresa.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhamento das Políticas</CardTitle>
          <CardDescription>Definições técnicas de acesso (PostgreSQL QUAL)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Comando</TableHead>
                <TableHead>Expressão (QUAL)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {diagnostics?.policies.map((p: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-mono text-xs">{p.policyname}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{p.cmd}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-[10px] text-muted-foreground">
                    {p.qual}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
