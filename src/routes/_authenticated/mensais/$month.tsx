import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  ChevronLeft, 
  DollarSign, 
  Package, 
  Receipt, 
  TrendingUp,
  FileText,
  AlertCircle,
  Loader2,
  Calendar
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/common/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, formatDate } from "@/lib/format";
import { getMonthlyReport } from "@/features/monthly/monthly.functions";
import { Link } from "@tanstack/react-router";

const MONTHS = [
  "", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

function MonthlyDetailPage() {
  const { month } = Route.useParams();
  const monthInt = parseInt(month);
  const currentYear = new Date().getFullYear();
  
  const reportFn = useServerFn(getMonthlyReport);
  const { data, isLoading, error } = useQuery({
    queryKey: ["monthly-report", currentYear, monthInt],
    queryFn: () => reportFn({ data: { year: currentYear, month: monthInt } }),
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-gold" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
        <AlertCircle className="size-12 text-destructive" />
        <h2 className="text-xl font-semibold">Erro ao carregar relatório</h2>
        <Button asChild variant="outline">
          <Link to="/mensais">Voltar para lista</Link>
        </Button>
      </div>
    );
  }

  const { summary, details, comparison } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="icon">
          <Link to="/mensais">
            <ChevronLeft className="size-5" />
          </Link>
        </Button>
        <PageHeader
          eyebrow={`Relatório Mensal · ${currentYear}`}
          title={MONTHS[monthInt]}
          description={`Visão detalhada de todos os dados operacionais de ${MONTHS[monthInt].toLowerCase()}.`}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <StatCard 
          label="Receita Bruta" 
          value={formatBRL(summary.revenue)} 
          icon={DollarSign} 
          accent="gold" 
        />
        <StatCard 
          label="Total Recebido" 
          value={formatBRL(summary.received)} 
          icon={ArrowUpRight} 
          accent="success" 
        />
        <StatCard 
          label="Despesas & Saídas" 
          value={formatBRL(summary.expenses)} 
          icon={ArrowDownRight} 
          accent="warning" 
        />
        <StatCard 
          label="Lucro Líquido" 
          value={formatBRL(summary.netProfit)} 
          icon={TrendingUp} 
          accent={summary.netProfit >= 0 ? "success" : "warning"} 
        />
        <StatCard 
          label="Pedidos" 
          value={summary.orderCount.toString()} 
          icon={Package} 
        />
      </div>

      <Tabs defaultValue="pedidos" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pedidos">Pedidos ({details.orders.length})</TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="resumo">Resumo Executivo</TabsTrigger>
        </TabsList>

        <TabsContent value="pedidos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Realizados em {MONTHS[monthInt]}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nº</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead className="text-right">Recebido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {details.orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                        Nenhum pedido registrado neste mês.
                      </TableCell>
                    </TableRow>
                  ) : (
                    details.orders.map((o) => (
                      <TableRow key={o.id}>
                        <TableCell className="font-mono text-xs">#{o.order_number}</TableCell>
                        <TableCell>{o.clients?.name || '—'}</TableCell>
                        <TableCell className="text-xs">
                          {o.brand} {o.model}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {o.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatBRL(o.sale_price)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatBRL(o.amount_received)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Entradas do Mês</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ref</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {details.financial.entries.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell className="text-xs">{formatDate(p.paid_at)}</TableCell>
                        <TableCell className="text-xs">Pedido #{p.orders?.order_number}</TableCell>
                        <TableCell className="text-right text-emerald-500">{formatBRL(p.amount)}</TableCell>
                      </TableRow>
                    ))}
                    {details.financial.entries.length === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Sem entradas</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Despesas e Saídas</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {/* Combine Exits and Expenses */}
                    {[...details.financial.exits, ...details.financial.expenses].sort((a, b) => 
                      new Date(b.paid_at || b.incurred_at).getTime() - new Date(a.paid_at || a.incurred_at).getTime()
                    ).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-xs">{formatDate(item.paid_at || item.incurred_at)}</TableCell>
                        <TableCell className="text-xs">{item.description || `Pedido #${item.orders?.order_number}`}</TableCell>
                        <TableCell className="text-right text-destructive">{formatBRL(item.amount)}</TableCell>
                      </TableRow>
                    ))}
                    {(details.financial.exits.length + details.financial.expenses.length) === 0 && (
                      <TableRow><TableCell colSpan={3} className="text-center py-4 text-muted-foreground">Sem saídas</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="resumo">
          <Card>
            <CardHeader>
              <CardTitle>Análise Comparativa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Crescimento de Receita</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">{formatBRL(summary.revenue)}</span>
                    <span className={`text-xs mb-1 ${summary.revenue >= comparison.prevMonthRevenue ? 'text-emerald-500' : 'text-destructive'}`}>
                      {comparison.prevMonthRevenue > 0 
                        ? `${(((summary.revenue - comparison.prevMonthRevenue) / comparison.prevMonthRevenue) * 100).toFixed(1)}%`
                        : '—'} 
                      vs mês anterior
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Evolução do Lucro</p>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold">{formatBRL(summary.netProfit)}</span>
                    <span className={`text-xs mb-1 ${summary.netProfit >= comparison.prevMonthProfit ? 'text-emerald-500' : 'text-destructive'}`}>
                      {comparison.prevMonthProfit !== 0
                        ? `${(((summary.netProfit - comparison.prevMonthProfit) / Math.abs(comparison.prevMonthProfit)) * 100).toFixed(1)}%`
                        : '—'}
                      vs mês anterior
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="rounded-lg bg-muted p-4 space-y-3">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="size-4 text-gold" />
                  Observações do Período
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Este relatório consolida todas as operações de {MONTHS[monthInt]} de {currentYear}. 
                  O lucro líquido de {formatBRL(summary.netProfit)} reflete a performance operacional após a dedução de 
                  {formatBRL(summary.expenses)} em despesas fixas e variáveis.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/mensais/$month")({
  component: MonthlyDetailPage,
});
