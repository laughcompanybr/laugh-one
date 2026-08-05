import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCompanyDetails, updateCompanySettings } from "@/domains/tenants/services/settings.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Building2, Save, ArrowLeft } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: SettingsPage,
});

function SettingsPage() {
  const getDetails = useServerFn(getCompanyDetails);
  const updateSettings = useServerFn(updateCompanySettings);

  const { data: company, isLoading, refetch } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => getDetails(),
  });

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      toast.success("Configurações atualizadas com sucesso!");
      refetch();
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="p-8">Carregando...</div>;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      logo_url: company?.logo_url || null,
      business_type: formData.get("business_type") as string,
      responsible_name: formData.get("responsible_name") as string,
      phone: formData.get("phone") as string,
      commercial_email: formData.get("commercial_email") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
    };
    mutation.mutate(data);
  };

  const onboarding = company?.company_onboarding_data?.[0];

  return (
    <div className="container max-w-4xl py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-gold flex items-center gap-1 mb-2">
            <ArrowLeft className="size-3" /> Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Configurações da Empresa</h1>
          <p className="text-muted-foreground">Gerencie a identidade e dados da sua empresa no Laugh One.</p>
        </div>
        <Building2 className="size-12 text-gold/20" />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8">
        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-4">Identidade Visual</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input id="name" name="name" defaultValue={company?.name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_type">Segmento de Atuação</Label>
              <Select name="business_type" defaultValue={company?.business_type}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barbearia">Barbearia</SelectItem>
                  <SelectItem value="Clínica">Clínica</SelectItem>
                  <SelectItem value="Restaurante">Restaurante</SelectItem>
                  <SelectItem value="Loja de Roupas">Loja de Roupas</SelectItem>
                  <SelectItem value="Agência">Agência</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 space-y-6">
          <h2 className="text-xl font-semibold border-b pb-4">Responsável e Contato</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="responsible_name">Nome do Responsável</Label>
              <Input id="responsible_name" name="responsible_name" defaultValue={onboarding?.responsible_name} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp / Telefone</Label>
              <Input id="phone" name="phone" defaultValue={onboarding?.phone} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commercial_email">E-mail Comercial</Label>
              <Input id="commercial_email" name="commercial_email" type="email" defaultValue={onboarding?.commercial_email} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" defaultValue={onboarding?.city} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" defaultValue={onboarding?.state} required />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-gold hover:bg-gold/90 text-black font-bold h-12 px-8" disabled={mutation.isPending}>
            {mutation.isPending ? "Salvando..." : (
              <span className="flex items-center gap-2">
                <Save className="size-4" /> Salvar Alterações
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
