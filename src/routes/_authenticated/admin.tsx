import { createFileRoute, redirect } from "@tanstack/react-router";
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  BarChart3, 
  History,
  TrendingUp,
  LayoutDashboard
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { getPlatformStats } from "@/features/admin/admin.functions";

export const Route = createFileRoute("/_authenticated/admin")({
  beforeLoad: async ({ context }) => {
    // Logica de proteção Super Admin aqui
  },
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => getPlatformStats(),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Super Admin" 
          description="Gerencie todas as empresas, planos e a saúde global do Laugh One."
      />

      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" className="border-gold/20 hover:bg-gold/5">
          <Link to="/admin/empresas">
            <Building2 className="mr-2 size-4 text-gold" />
            Gerenciar Empresas
          </Link>
        </Button>
        <Button variant="outline" className="border-gold/20 hover:bg-gold/5">
          <CreditCard className="mr-2 size-4 text-gold" />
          Planos e Preços
        </Button>
        <Button variant="outline" className="border-gold/20 hover:bg-gold/5">
          <History className="mr-2 size-4 text-gold" />
          Audit Logs
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total de Empresas" 
          value={stats?.totalCompanies} 
          icon={<Building2 className="size-5" />} 
          trend="+12%"
        />
        <StatCard 
          title="Empresas Ativas" 
          value={stats?.activeCompanies} 
          icon={<Activity className="size-5" />} 
          color="text-emerald-500"
        />
        <StatCard 
          title="Usuários Totais" 
          value={stats?.totalUsers} 
          icon={<Users className="size-5" />} 
        />
        <StatCard 
          title="Recorrência Mensal (MRR)" 
          value="R$ 45.200" 
          icon={<TrendingUp className="size-5" />} 
          color="text-gold"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold flex items-center gap-2">
              <BarChart3 className="size-5 text-gold" />
              Crescimento da Plataforma
            </h3>
          </div>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground border border-dashed rounded-xl">
            Gráfico de Crescimento (Empresas x Tempo)
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-6">
            <History className="size-5 text-gold" />
            Atividades Recentes
          </h3>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="size-2 rounded-full bg-gold mt-1.5 shrink-0" />
                <div>
                  <p className="font-medium">Empresa "Nova Tech" criada</p>
                  <p className="text-muted-foreground text-xs">Há {i * 10} minutos</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, color }: any) {
  return (
    <Card className="p-6 relative overflow-hidden group border-gold/10 hover:border-gold/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</span>
        <div className={`p-2 rounded-lg bg-gold/5 ${color || "text-gold"}`}>
          {icon}
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-display font-bold">{value ?? "..."}</span>
        {trend && <span className="text-xs font-medium text-emerald-500">{trend}</span>}
      </div>
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-gold/30 group-hover:w-full transition-all duration-500" />
    </Card>
  );
}
