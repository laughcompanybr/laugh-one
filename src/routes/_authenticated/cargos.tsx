import { createFileRoute } from "@tanstack/react-router";
import { usePermissions } from "@/domains/auth/hooks/use-permissions";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useCompany } from "@/domains/tenants/hooks/use-company";
import { Shield, Plus, Copy, Trash2, Search, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export const Route = createFileRoute("/_authenticated/cargos")({
  component: RolesPage,
});

function RolesPage() {
  const { hasPermission } = usePermissions();
  const { company } = useCompany();
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [rolePermissions, setRolePermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (company?.id) {
      loadData();
    }
  }, [company?.id]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.all([
        supabase.from("company_roles" as any).select("*").eq("company_id", company?.id).order("order"),
        supabase.from("permissions" as any).select("*").order("category")
      ]);

      if (rolesRes.data) setRoles(rolesRes.data);
      if (permsRes.data) setPermissions(permsRes.data);
      
      if (rolesRes.data?.[0]) {
        handleSelectRole(rolesRes.data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectRole(role: any) {
    setSelectedRole(role);
    const { data } = await supabase
      .from("role_permissions" as any)
      .select("permission_id")
      .eq("role_id", role.id);
    
    if (data) {
      setRolePermissions(data.map((p: any) => p.permission_id));
    }
  }

  async function togglePermission(permissionId: string) {
    if (!selectedRole || !company?.id) return;

    const isEnabled = rolePermissions.includes(permissionId);
    
    try {
      if (isEnabled) {
        await supabase
          .from("role_permissions" as any)
          .delete()
          .match({ role_id: selectedRole.id, permission_id: permissionId });
        setRolePermissions(prev => prev.filter(id => id !== permissionId));
      } else {
        await supabase
          .from("role_permissions" as any)
          .insert({ 
            role_id: selectedRole.id, 
            permission_id: permissionId,
            company_id: company.id 
          });
        setRolePermissions(prev => [...prev, permissionId]);
      }
      toast.success("Permissão atualizada");
    } catch (error: any) {
      toast.error("Erro ao atualizar: " + error.message);
    }
  }

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
            <Button size="icon" variant="ghost" className="size-8">
              <Plus className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {roles.map((role) => (
              <button
                key={role.id}
                onClick={() => handleSelectRole(role)}
                className={`flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-all ${
                  selectedRole?.id === role.id 
                    ? "bg-primary/10 text-primary shadow-sm" 
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Shield className="size-4" style={{ color: role.color }} />
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
                <CardTitle className="text-xl">Permissões: {selectedRole?.name}</CardTitle>
                <CardDescription>Configure o que este cargo pode acessar e realizar no sistema.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Copy className="size-4" /> Duplicar
                </Button>
                {!selectedRole?.is_system && (
                  <Button variant="destructive" size="sm" className="gap-2">
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
                            checked={rolePermissions.includes(permission.id)}
                            onCheckedChange={() => togglePermission(permission.id)}
                          />
                        </div>
                      ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
