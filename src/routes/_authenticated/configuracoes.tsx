import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getCompanyDetails, updateCompanySettings } from "@/domains/tenants/services/settings.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Building2, Save, ArrowLeft, Globe, Phone, Mail, MapPin, Users, Briefcase, Settings as SettingsIcon } from "lucide-react";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/configuracoes")({
  component: SettingsPage,
});

function SettingsPage() {
  const getDetails = useServerFn(getCompanyDetails);
  const updateSettings = useServerFn(updateCompanySettings);

  const { data: company, isLoading, refetch } = useQuery({
    queryKey: ["company-settings"],
    queryFn: () => getDetails({}),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => updateSettings({ data }),
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
      business_type: formData.get("business_type") as string,
      business_description: formData.get("business_description") as string,
      phone: formData.get("phone") as string,
      whatsapp: formData.get("whatsapp") as string,
      commercial_email: formData.get("commercial_email") as string,
      website: formData.get("website") as string,
      address: formData.get("address") as string,
      city: formData.get("city") as string,
      state: formData.get("state") as string,
      country: formData.get("country") as string,
      employee_count: parseInt(formData.get("employee_count") as string) || 0,
      operating_segment: formData.get("operating_segment") as string,
      // Logic for arrays and jsonb would go here if needed, keeping it simple for text fields
    };
    mutation.mutate(data);
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-gold flex items-center gap-1 mb-2">
            <ArrowLeft className="size-3" /> Voltar ao Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Configurações da Empresa</h1>
          <p className="text-muted-foreground">Gerencie todos os dados operacionais e informações da sua organização.</p>
        </div>
        <Building2 className="size-12 text-gold/20" />
      </div>

      <form onSubmit={handleSubmit} className="grid gap-8">
        {/* Informações Gerais */}
        <div className="rounded-xl border border-gold/10 bg-card/50 backdrop-blur-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gold/10 pb-4">
            <Building2 className="size-5 text-gold" />
            <h2 className="text-xl font-semibold">Informações Gerais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nome da Empresa</Label>
              <Input id="name" name="name" defaultValue={company?.name || ""} required className="bg-background/50 border-gold/20 focus:border-gold" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="business_type">Tipo de Empresa</Label>
              <Input id="business_type" name="business_type" defaultValue={company?.business_type || ""} placeholder="Ex: LTDA, MEI, etc." className="bg-background/50 border-gold/20" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="business_description">Descrição da Empresa</Label>
              <Textarea id="business_description" name="business_description" defaultValue={company?.business_description || ""} placeholder="Uma breve descrição sobre o que sua empresa faz..." className="bg-background/50 border-gold/20 min-h-[100px]" />
            </div>
          </div>
        </div>

        {/* Contato e Presença Digital */}
        <div className="rounded-xl border border-gold/10 bg-card/50 backdrop-blur-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gold/10 pb-4">
            <Globe className="size-5 text-gold" />
            <h2 className="text-xl font-semibold">Contato e Presença Digital</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone Fixo</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="phone" name="phone" defaultValue={company?.phone || ""} className="pl-9 bg-background/50 border-gold/20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-500" />
                <Input id="whatsapp" name="whatsapp" defaultValue={company?.whatsapp || ""} className="pl-9 bg-background/50 border-gold/20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="commercial_email">E-mail Comercial</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="commercial_email" name="commercial_email" type="email" defaultValue={company?.commercial_email || ""} className="pl-9 bg-background/50 border-gold/20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Site Oficial</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="website" name="website" defaultValue={company?.website || ""} placeholder="https://..." className="pl-9 bg-background/50 border-gold/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Localização */}
        <div className="rounded-xl border border-gold/10 bg-card/50 backdrop-blur-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gold/10 pb-4">
            <MapPin className="size-5 text-gold" />
            <h2 className="text-xl font-semibold">Localização</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input id="address" name="address" defaultValue={company?.address || ""} className="bg-background/50 border-gold/20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" name="city" defaultValue={company?.city || ""} className="bg-background/50 border-gold/20" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">Estado</Label>
                <Input id="state" name="state" defaultValue={company?.state || ""} className="bg-background/50 border-gold/20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">País</Label>
              <Input id="country" name="country" defaultValue={company?.country || "Brasil"} className="bg-background/50 border-gold/20" />
            </div>
          </div>
        </div>

        {/* Dados Operacionais */}
        <div className="rounded-xl border border-gold/10 bg-card/50 backdrop-blur-sm p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gold/10 pb-4">
            <Briefcase className="size-5 text-gold" />
            <h2 className="text-xl font-semibold">Dados Operacionais</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="employee_count">Quantidade de Funcionários</Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input id="employee_count" name="employee_count" type="number" defaultValue={company?.employee_count || 0} className="pl-9 bg-background/50 border-gold/20" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Segmento de Operação</Label>
              <Select name="operating_segment" defaultValue={company?.operating_segment || company?.business_type || ""}>
                <SelectTrigger className="bg-background/50 border-gold/20">
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barbearia">Barbearia</SelectItem>
                  <SelectItem value="Clínica">Clínica</SelectItem>
                  <SelectItem value="Restaurante">Restaurante</SelectItem>
                  <SelectItem value="Joalheria">Joalheria</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Outro">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex justify-between items-center bg-card/50 backdrop-blur-sm p-6 rounded-xl border border-gold/10 sticky bottom-8 z-10">
          <p className="text-sm text-muted-foreground max-w-md">
            Todas as alterações realizadas serão registradas permanentemente no histórico de auditoria da empresa.
          </p>
          <Button type="submit" className="bg-gold hover:bg-gold/90 text-black font-bold h-12 px-10 shadow-lg shadow-gold/20" disabled={mutation.isPending}>
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
