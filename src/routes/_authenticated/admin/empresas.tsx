import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/common/PageHeader";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getCompanies, updateCompanyStatus, impersonateCompany } from "@/features/admin/admin.functions";
import { Button } from "@/components/ui/button";
import { 
  Building2, 
  MoreVertical, 
  UserCog, 
  Ban, 
  CheckCircle2, 
  ExternalLink,
  Search,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/empresas")({
  component: AdminCompanies,
});

function AdminCompanies() {
  const queryClient = useQueryClient();
  const { data: companies, isLoading } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: () => getCompanies(),
  });

  const statusMutation = useMutation({
    mutationFn: (vars: { id: string, status: string }) => updateCompanyStatus(vars),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      toast.success("Status da empresa atualizado.");
    }
  });

  const impersonateMutation = useMutation({
    mutationFn: (companyId: string) => impersonateCompany({ companyId }),
    onSuccess: () => {
      toast.success("Entrando como empresa... Redirecionando para o Dashboard.");
      window.location.href = "/dashboard";
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-end justify-between">
        <PageHeader 
          title="Gestão de Empresas" 
          description="Administre todas as organizações na plataforma Laugh One."
        />
        <Button className="bg-gold hover:bg-gold/90 text-gold-foreground">
          <Plus className="mr-2 size-4" /> Nova Empresa
        </Button>
      </div>

      <Card className="p-0 overflow-hidden border-gold/10">
        <div className="p-4 border-b border-gold/10 bg-muted/30 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Buscar empresa por nome ou slug..." className="pl-9 bg-background" />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gold/10 bg-muted/30 text-muted-foreground font-medium">
                <th className="px-6 py-4 text-left">Empresa</th>
                <th className="px-6 py-4 text-left">Plano</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-left">Data de Criação</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold/10">
              {companies?.map((company) => (
                <tr key={company.id} className="hover:bg-gold/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-gold/10 flex items-center justify-center text-gold border border-gold/20 font-bold group-hover:scale-110 transition-transform">
                        {company.logo_url ? (
                          <img src={company.logo_url} alt="" className="size-full object-contain rounded-xl" />
                        ) : (
                          company.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold">{company.name}</p>
                        <p className="text-xs text-muted-foreground">{company.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className="border-gold/30 text-gold bg-gold/5">
                      {company.plans?.name || "Trial"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={company.status || "active"} />
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">
                    {company.created_at ? new Date(company.created_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-gold/10 text-muted-foreground hover:text-gold">
                          <MoreVertical className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem 
                          className="flex items-center gap-2 cursor-pointer"
                          onClick={() => impersonateMutation.mutate(company.id)}
                        >
                          <UserCog className="size-4" /> Entrar como empresa
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="flex items-center gap-2 cursor-pointer">
                          <ExternalLink className="size-4" /> Ver Detalhes
                        </DropdownMenuItem>
                        {company.status !== 'blocked' ? (
                          <DropdownMenuItem 
                            className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
                            onClick={() => statusMutation.mutate({ id: company.id, status: 'blocked' })}
                          >
                            <Ban className="size-4" /> Bloquear Empresa
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            className="flex items-center gap-2 text-emerald-500 focus:text-emerald-500 cursor-pointer"
                            onClick={() => statusMutation.mutate({ id: company.id, status: 'active' })}
                          >
                            <CheckCircle2 className="size-4" /> Reativar Empresa
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs: any = {
    active: { label: "Ativa", className: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
    blocked: { label: "Bloqueada", className: "bg-destructive/10 text-destructive border-destructive/20" },
    trial: { label: "Em Teste", className: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    suspended: { label: "Suspensa", className: "bg-muted text-muted-foreground" },
  };

  const config = configs[status] || configs.active;

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}
