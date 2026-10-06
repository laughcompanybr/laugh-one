import { createFileRoute } from "@tanstack/react-router";
import { usePermissions } from "@/domains/auth/hooks/use-permissions";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { toast } from "sonner";
import { useCompany } from "@/domains/tenants/hooks/use-company";
import { Shield, Plus, Copy, Trash2, Search, History, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getRolesAndPermissions, 
  updateRolePermissions 
} from "@/domains/auth/services/admin.functions";

export const Route = createFileRoute("/_authenticated/cargos")({
  component: RolesPage,
});

function RolesPage() {
  const { hasPermission } = usePermissions();
  const { company } = useCompany();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [roleActionPending, setRoleActionPending] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["roles-and-permissions", company?.id],
    queryFn: () => getRolesAndPermissions(),
    enabled: !!company?.id
  });

  const mutation = useMutation({
    mutationFn: (vars: { roleId: string, companyId: string, permissionIds: string[] }) => 
      updateRolePermissions({ data: vars }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles-and-permissions"] });
      toast.success("Permissões atualizadas");
    },
    onError: (err: any) => {
      toast.error("Erro ao atualizar: " + err.message);
    }
  });

  const roles = data?.roles || [];
  const permissions = data?.permissions || [];
  const rolePermissions = data?.rolePermissions || [];

  const currentRole = selectedRole || roles[0];
  
  // Create a map of role_id -> permission_ids[]
  const rolePermissionsMap: Record<string, string[]> = {};
  rolePermissions.forEach((rp: any) => {
    if (!rolePermissionsMap[rp.role_id]) {
      rolePermissionsMap[rp.role_id] = [];
    }
    rolePermissionsMap[rp.role_id].push(rp.permission_id);
  });

  const activePermissions = currentRole ? (rolePermissionsMap[currentRole.id] || []) : [];

  const refreshRoles = () => queryClient.invalidateQueries({ queryKey: ["roles-and-permissions"] });

  const createRole = async (duplicate = false) => {
    if (!company?.id) return;
    const source = currentRole;
    const name = (duplicate ? `${source?.name ?? "Cargo"} — cópia` : roleName).trim();
    if (!name) { toast.error("Informe o nome do cargo."); return; }
    setRoleActionPending(true);
    try {
      const { data: created, error } = await supabase.from("company_roles").insert({
        company_id: company.id,
        name,
        description: duplicate ? source?.description ?? null : roleDescription.trim() || null,
        color: duplicate ? source?.color ?? null : null,
        icon: duplicate ? source?.icon ?? null : null,
        is_active: true,
        is_system: false,
        order: (roles.reduce((max, role: any) => Math.max(max, Number(role.order ?? 0)), 0) + 1),
      }).select("*").single();
      if (error) throw error;
      const sourcePermissions = duplicate && source ? rolePermissionsMap[source.id] ?? [] : [];
      if (sourcePermissions.length) {
        const { error: permissionsError } = await supabase.from("role_permissions").insert(
          sourcePermissions.map((permissionId) => ({ role_id: created.id, permission_id: permissionId, company_id: company.id }))
        );
        if (permissionsError) throw permissionsError;
      }
      setSelectedRole(created);
      setCreateOpen(false);
      setRoleName("");
      setRoleDescription("");
      refreshRoles();
      toast.success(duplicate ? "Cargo duplicado com sucesso." : "Cargo criado com sucesso.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível criar o cargo.");
    } finally { setRoleActionPending(false); }
  };

  const deleteRole = async () => {
    if (!company?.id || !currentRole || currentRole.is_system) return;
    if (!window.confirm(`Excluir o cargo "${currentRole.name}"?`)) return;
    setRoleActionPending(true);
    try {
      const { error } = await supabase.from("company_roles").delete().eq("id", currentRole.id).eq("company_id", company.id);
      if (error) throw error;
      setSelectedRole(null);
      refreshRoles();
      toast.success("Cargo excluído.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível excluir o cargo.");
    } finally { setRoleActionPending(false); }
  };

  const togglePermission = (permissionId: string) => {
    if (!currentRole || !company?.id) return;
    
    const isEnabled = activePermissions.includes(permissionId);
    const newPermissionIds = isEnabled 
      ? activePermissions.filter(id => id !== permissionId)
      : [...activePermissions, permissionId];

    mutation.mutate({ 
      roleId: currentRole.id, 
      companyId: company.id,
      permissionIds: newPermissionIds
    });
  };

  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Carregando permissões...</div>;

  const filteredPermissions = permissions.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(permissions.map(p => p.category)));

  return (
    <div className="space-y-8 p-8">
      <PageHeader
        title="Controle de Acesso (RBAC)"
        description="Gerencie cargos e defina permissões detalhadas para os usuários da sua empresa."
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Sidebar: Roles List */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Cargos</CardTitle>
            <Button size="icon" variant="ghost" className="size-8" onClick={() => setCreateOpen(true)} aria-label="Criar cargo">
              <Plus className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map((role: any) => (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all ${
                  (currentRole?.id === role.id) 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="size-4" style={{ color: role.color || undefined }} />
                  <div>
                    <div className="text-sm font-medium">{role.name}</div>
                    <div className="text-xs text-muted-foreground">{role.description}</div>
                  </div>
                </div>
                {role.is_system && <Badge variant="secondary" className="text-[10px]">Sistema</Badge>}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Main Content: Permissions Editor */}
        <Card className="lg:col-span-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Permissões: {currentRole?.name}</CardTitle>
                <CardDescription>Configure o que este cargo pode acessar e realizar no sistema.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2" onClick={() => void createRole(true)} disabled={roleActionPending || !currentRole}>
                  <Copy className="size-4" /> Duplicar
                </Button>
                {!currentRole?.is_system && (
                  <Button variant="destructive" size="sm" className="gap-2" onClick={() => void deleteRole()} disabled={roleActionPending}>
                    <Trash2 className="size-4" /> Excluir
                  </Button>
                )}
              </div>
            </div>
            <div className="mt-4 relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Pesquisar permissões..." 
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            {categories.length > 0 ? (
              <Tabs defaultValue={categories[0]} className="w-full">
                <TabsList className="mb-6 w-full justify-start overflow-x-auto bg-muted/50 p-1">
                  {categories.map(cat => (
                    <TabsTrigger key={cat} value={cat} className="text-xs uppercase tracking-wider">
                      {cat}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map(category => (
                  <TabsContent key={category} value={category} className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredPermissions
                        .filter(p => p.category === category)
                        .map(permission => (
                          <div 
                            key={permission.id}
                            className="flex items-center justify-between rounded-lg border p-4 transition-all hover:bg-muted/30"
                          >
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">{permission.name}</div>
                              <div className="text-xs text-muted-foreground">{permission.description}</div>
                            </div>
                            <Switch 
                              checked={activePermissions.includes(permission.id)}
                              onCheckedChange={() => togglePermission(permission.id)}
                              disabled={mutation.isPending}
                            />
                          </div>
                        ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="py-12 text-center text-muted-foreground">Nenhuma permissão encontrada.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
