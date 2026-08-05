import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { 
  ShieldAlert, 
  Users, 
  Building2, 
  CreditCard, 
  Activity, 
  BarChart3, 
  History,
  TrendingUp,
  LayoutDashboard,
  UserPlus,
  ShieldCheck,
  AlertTriangle,
  RefreshCcw,
  CheckCircle,
  Database,
  ArrowRight,
  UserCheck
} from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlatformStats } from "@/features/admin/admin.functions";
import { useState } from "react";
import { 
  getUnlinkedUsers, 
  getCompanies, 
  getRolesAndPermissions, 
  provisionUser,
  getAuditLogs
} from "@/domains/auth/services/admin.functions";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ["platform-stats"],
    queryFn: () => getPlatformStats(),
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-8">
      <div className="flex items-center justify-between">
        <PageHeader 
          title="Super Admin" 
          description="Controle global da plataforma Laugh One."
        />
        <UserProvisioningWizard />
      </div>

      <div className="flex items-center gap-4 mb-8">
        <Button asChild variant="outline" className="border-gold/20 hover:bg-gold/5">
          <Link to="/admin/empresas">
            <Building2 className="mr-2 size-4 text-gold" />
            Gerenciar Empresas
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-gold/20 hover:bg-gold/5">
          <Link to="/_authenticated/cargos">
            <ShieldCheck className="mr-2 size-4 text-gold" />
            Cargos e Permissões
          </Link>
        </Button>
        <Button asChild variant="outline" className="border-gold/20 hover:bg-gold/5">
          <Link to="/_authenticated/auditoria">
            <History className="mr-2 size-4 text-gold" />
            Audit Logs
          </Link>
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
            Provisionamentos Recentes
          </h3>
          <RecentProvisioningList />
        </Card>
      </div>
    </div>
  );
}

function UserProvisioningWizard() {
  const [open, setOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: unlinkedUsers } = useQuery({
    queryKey: ["unlinked-users"],
    queryFn: () => getUnlinkedUsers(),
    enabled: open
  });

  const { data: companies } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => getCompanies(),
    enabled: open
  });

  const { data: rolesData } = useQuery({
    queryKey: ["admin-roles", selectedCompany],
    queryFn: () => getRolesAndPermissions(),
    enabled: open && !!selectedCompany
  });

  const mutation = useMutation({
    mutationFn: (vars: { userId: string, companyId: string, roleId: string }) => 
      provisionUser(vars),
    onSuccess: () => {
      toast.success("Usuário vinculado com sucesso!");
      queryClient.invalidateQueries({ queryKey: ["unlinked-users"] });
      queryClient.invalidateQueries({ queryKey: ["recent-audit-provisioning"] });
      setOpen(false);
      setSelectedUser("");
      setSelectedCompany("");
      setSelectedRole("");
    },
    onError: (err: any) => {
      toast.error("Erro ao vincular: " + err.message);
    }
  });

  const handleProvision = () => {
    if (!selectedUser || !selectedCompany || !selectedRole) {
      toast.error("Selecione todos os campos");
      return;
    }
    mutation.mutate({ userId: selectedUser, companyId: selectedCompany, roleId: selectedRole });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gold hover:bg-gold/90 text-black font-bold gap-2">
          <UserPlus className="size-4" />
          Assistente de Vínculo
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="text-gold size-5" />
            Provisionamento Blindado
          </DialogTitle>
          <DialogDescription>
            Vincule usuários sem empresa a um tenant e cargo válido com verificação automática.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">1. Usuário Pendente</label>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {unlinkedUsers?.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name || 'Sem nome'} ({u.id.substring(0,8)})</SelectItem>
                ))}
                {(!unlinkedUsers || unlinkedUsers.length === 0) && <p className="p-2 text-xs text-center text-muted-foreground">Nenhum usuário pendente</p>}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">2. Empresa (Tenant)</label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a empresa" />
              </SelectTrigger>
              <SelectContent>
                {companies?.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase text-muted-foreground">3. Cargo (RBAC)</label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={!selectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cargo" />
              </SelectTrigger>
              <SelectContent>
                {rolesData?.roles.filter(r => r.company_id === selectedCompany).map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
                {(!rolesData?.roles || !rolesData.roles.some(r => r.company_id === selectedCompany)) && selectedCompany && (
                  <p className="p-2 text-xs text-center text-muted-foreground">Nenhum cargo encontrado para esta empresa</p>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button 
            className="bg-gold hover:bg-gold/90 text-black font-bold" 
            onClick={handleProvision}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Processando..." : "Confirmar Vínculo"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function RecentProvisioningList() {
  const { data: logs } = useQuery({
    queryKey: ["recent-audit-provisioning"],
    queryFn: () => getAuditLogs(),
  });

  const provisioningLogs = logs?.filter(l => l.table_name === 'profiles') || [];

  return (
    <div className="space-y-4">
      {provisioningLogs.slice(0, 5).map((log: any) => (
        <div key={log.id} className="flex gap-3 text-sm border-b border-white/5 pb-3 last:border-0">
          <div className="size-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
            <UserCheck className="size-4 text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">Usuário {(log.profiles as any)?.full_name || 'Sistema'} atualizado</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-[10px] py-0">{log.operation}</Badge>
              <p className="text-muted-foreground text-[10px]">
                {format(new Date(log.changed_at), "dd/MM/yy HH:mm", { locale: ptBR })}
              </p>
            </div>
          </div>
        </div>
      ))}
      {(!provisioningLogs || provisioningLogs.length === 0) && <p className="text-center text-muted-foreground py-8">Sem atividades recentes.</p>}
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
