import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Building2, Briefcase, User, Phone, Mail, MapPin, Users, Target, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const onboardingSchema = z.object({
  companyName: z.string().min(2, "Nome da empresa é obrigatório"),
  businessType: z.string().min(1, "Selecione o segmento"),
  responsibleName: z.string().min(2, "Nome do responsável é obrigatório"),
  phone: z.string().min(10, "Telefone inválido"),
  commercialEmail: z.string().email("E-mail inválido"),
  city: z.string().min(2, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório"),
  employeeCount: z.string().min(1, "Selecione a quantidade de funcionários"),
  mainObjective: z.string().min(1, "Selecione o objetivo"),
  
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

const BUSINESS_TYPES = [
  "Barbearia", "Salão de beleza", "Loja de roupas", "Joalheria", 
  "Loja de eletrônicos", "Restaurante", "Delivery", "Clínica", 
  "Academia", "Agência", "Prestador de serviços", "Outro"
];

const EMPLOYEE_COUNTS = ["1-5", "6-20", "21-50", "50+"];
const OBJECTIVES = [
  "Organizar vendas", "Melhorar financeiro", "Gestão de estoque", 
  "Fidelizar clientes", "Escalar o negócio", "Outro"
];

export function OnboardingWizard({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [loadingExisting, setLoadingExisting] = useState(true);
  
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      companyName: "",
      businessType: "",
      responsibleName: "",
      phone: "",
      commercialEmail: "",
      city: "",
      state: "",
      employeeCount: "",
      mainObjective: "",
    }
  });

  useEffect(() => {
    let active = true;
    const loadExisting = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData.session?.user?.id;
        if (!userId) return;
        const { data: profile } = await supabase.from("profiles").select("company_id, full_name, phone").eq("id", userId).maybeSingle();
        if (!profile?.company_id) return;
        const [{ data: company }, { data: existing }] = await Promise.all([
          supabase.from("companies").select("name, business_type").eq("id", companyId).maybeSingle(),
          supabase.from("company_onboarding_data").select("business_type, responsible_name, phone, commercial_email, city, state, employee_count, main_objective").eq("company_id", companyId).maybeSingle(),
        ]);
        if (!active) return;
        form.reset({
          companyName: company?.name ?? "",
          businessType: existing?.business_type ?? company?.business_type ?? "",
          responsibleName: existing?.responsible_name ?? profile.full_name ?? "",
          phone: existing?.phone ?? profile.phone ?? "",
          commercialEmail: existing?.commercial_email ?? sessionData.session?.user?.email ?? "",
          city: existing?.city ?? "",
          state: existing?.state ?? "",
          employeeCount: existing?.employee_count ?? "",
          mainObjective: existing?.main_objective ?? "",
        });
      } finally {
        if (active) setLoadingExisting(false);
      }
    };
    void loadExisting();
    return () => { active = false; };
  }, [form]);

  const onSubmit = async (data: OnboardingFormValues) => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) throw new Error("Sua sessão expirou. Faça login novamente.");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", userId)
        .maybeSingle();
      if (profileError) throw profileError;
      if (!profile?.company_id) throw new Error("Usuário não está vinculado a uma empresa.");
      const companyId = profile.company_id;

      const { error: companyError } = await supabase
        .from("companies")
        .update({
          name: data.companyName,
          business_type: data.businessType,
          onboarding_status: "completed",
          theme: "dark",
          enabled_modules: ["dashboard", "clients", "orders", "finance", "reports"],
        } as any)
        .eq("id", companyId);
      if (companyError) throw companyError;

      const { error: onboardingError } = await supabase
        .from("company_onboarding_data")
        .upsert({
          company_id: companyId,
          business_type: data.businessType,
          responsible_name: data.responsibleName,
          phone: data.phone,
          commercial_email: data.commercialEmail,
          city: data.city,
          state: data.state.toUpperCase(),
          employee_count: data.employeeCount,
          main_objective: data.mainObjective,
          onboarding_completed: true,
        }, { onConflict: "company_id" });
      if (onboardingError) throw onboardingError;

      const { data: template, error: templateError } = await supabase
        .from("business_templates")
        .select("enabled_modules")
        .eq("business_type", data.businessType)
        .maybeSingle();
      if (templateError) throw templateError;

      const configuredModules = Array.isArray(template?.enabled_modules)
        ? template.enabled_modules
        : ["dashboard", "clients", "orders", "finance", "reports"];

      const { data: allModules, error: modulesError } = await supabase
        .from("modules")
        .select("id, name");
      if (modulesError) throw modulesError;

      const legacyNames: Record<string, string> = {
        dashboard: "Dashboard", orders: "Pedidos", products: "Produtos",
        clients: "Clientes", suppliers: "Fornecedores", employees: "Funcionários",
        finance: "Financeiro", reports: "Relatórios", automation: "Automações", settings: "Configurações",
      };

      const moduleIds = configuredModules
        .map((value: unknown) => String(value))
        .map((value: string) => {
          const direct = allModules?.find((module: any) => module.id === value);
          if (direct) return direct.id;
          const targetName = legacyNames[value.toLowerCase()] ?? value;
          return allModules?.find((module: any) => module.name.toLowerCase() === targetName.toLowerCase())?.id ?? null;
        })
        .filter((id: string | null): id is string => Boolean(id));
      if (moduleIds.length === 0) throw new Error("Não foi possível identificar os módulos para este segmento.");

      const { error: moduleError } = await supabase
        .from("company_modules")
        .upsert(moduleIds.map((moduleId) => ({
          company_id: companyId, module_id: moduleId, is_enabled: true, activated_at: new Date().toISOString(),
        })), { onConflict: "company_id,module_id" });
      if (moduleError) throw moduleError;

      toast.success("Configuração inicial concluída com sucesso!");
      onComplete();
    } catch (error: any) {
      toast.error("Erro ao salvar configurações: " + error.message);
    }
  };

  const nextStep = async () => {
    const fields = step === 1 
      ? ['companyName', 'businessType', 'responsibleName'] 
      : ['phone', 'commercialEmail', 'city', 'state'];
    
    const isValid = await form.trigger(fields as any);
    if (isValid) setStep(prev => prev + 1);
  };

  if (loadingExisting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="size-5 animate-spin text-gold" /> Preparando sua configuração…
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl border-gold/20 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <LaughLogo size={40} showWordmark />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold">Configuração inicial</p>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Bem-vindo ao Laugh One
          </CardTitle>
          <CardDescription>
            Vamos personalizar seu ambiente. Leva menos de 2 minutos e deixa o painel pronto para sua operação.
          </CardDescription>
          
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1.5 w-12 rounded-full transition-all duration-300 ${
                  s <= step ? "bg-gold" : "bg-muted"
                }`} 
              />
            ))}
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Building2 className="size-4 text-gold" /> Nome da Empresa
                  </Label>
                  <Input placeholder="Ex: Laugh Store" {...form.register("companyName")} />
                  {form.formState.errors.companyName && (
                    <p className="text-xs text-destructive">{form.formState.errors.companyName.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="size-4 text-gold" /> Segmento de Atuação
                  </Label>
                  <Select onValueChange={(v) => form.setValue("businessType", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Qual o tipo da sua empresa?" />
                    </SelectTrigger>
                    <SelectContent>
                      {BUSINESS_TYPES.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.businessType && (
                    <p className="text-xs text-destructive">{form.formState.errors.businessType.message}</p>
                  )}
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <User className="size-4 text-gold" /> Nome do Responsável
                  </Label>
                  <Input placeholder="Seu nome completo" {...form.register("responsibleName")} />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <Phone className="size-4 text-gold" /> WhatsApp/Telefone
                    </Label>
                    <Input placeholder="(00) 00000-0000" {...form.register("phone")} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <Mail className="size-4 text-gold" /> E-mail Comercial
                    </Label>
                    <Input type="email" placeholder="contato@empresa.com" {...form.register("commercialEmail")} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="size-4 text-gold" /> Cidade
                    </Label>
                    <Input placeholder="Sua cidade" {...form.register("city")} />
                  </div>
                  <div className="grid gap-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="size-4 text-gold" /> Estado (UF)
                    </Label>
                    <Input placeholder="UF" maxLength={2} {...form.register("state")} />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Users className="size-4 text-gold" /> Quantidade de Funcionários
                  </Label>
                  <Select onValueChange={(v) => form.setValue("employeeCount", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYEE_COUNTS.map(count => (
                        <SelectItem key={count} value={count}>{count}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label className="flex items-center gap-2">
                    <Target className="size-4 text-gold" /> Objetivo Principal
                  </Label>
                  <Select onValueChange={(v) => form.setValue("mainObjective", v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="O que você busca com o Laugh One?" />
                    </SelectTrigger>
                    <SelectContent>
                      {OBJECTIVES.map(obj => (
                        <SelectItem key={obj} value={obj}>{obj}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 rounded-xl bg-gold/5 border border-gold/20 text-sm text-muted-foreground flex items-start gap-3">
                  <CheckCircle2 className="size-5 text-gold shrink-0 mt-0.5" />
                  <p>
                    Com base no segmento <strong>{form.watch("businessType")}</strong>, ativaremos automaticamente os módulos 
                    essenciais para sua operação logo após a confirmação.
                  </p>
                </div>
              </div>
            )}
          </form>
        </CardContent>

        <CardFooter className="flex justify-between border-t border-white/5 pt-6">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(prev => prev - 1)}>
              Voltar
            </Button>
          ) : <div />}
          
          {step < 3 ? (
            <Button onClick={nextStep} className="bg-gold hover:bg-gold/90 text-black font-bold px-8">
              Continuar
            </Button>
          ) : (
            <Button 
              onClick={form.handleSubmit(onSubmit)} 
              disabled={form.formState.isSubmitting}
              className="bg-gold hover:bg-gold/90 text-black font-bold px-8 gap-2 shadow-[0_0_20px_rgba(212,175,55,0.2)]"
            >
              {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" />}
              Finalizar Configuração
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
