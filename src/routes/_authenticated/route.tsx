import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Loader2, UserPlus, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { OnboardingWizard } from "@/domains/tenants/components/OnboardingWizard";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) throw redirect({ to: "/auth" });
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      throw redirect({ to: "/mfa-verify" });
    }
    return { user: data.session.user };
  },
  pendingComponent: AuthPending,
  pendingMs: 800,
  pendingMinMs: 400,
  component: LayoutComponent,
});

function AuthPending() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background">
      <LaughLogo size={40} showWordmark />
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin text-gold" />
        Verificando sessão…
      </div>
    </div>
  );
}

function LayoutComponent() {
  const queryClient = useQueryClient();
  const { data: profile, isLoading: isProfileLoading, error: profileError } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*, companies!profiles_company_id_fkey(*), company_roles(*)")
        .eq("id", userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    retry: 2,
  });

  const { data: onboarding, isLoading: isOnboardingLoading } = useQuery({
    queryKey: ["onboarding-status"],
    queryFn: async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const userId = sessionData.session?.user?.id;
      if (!userId) return { status: "no_company" as const };

      const { data: currentProfile, error: profileLookupError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", userId)
        .maybeSingle();
      if (profileLookupError) throw profileLookupError;
      if (!currentProfile?.company_id) return { status: "no_company" as const };

      const [{ data: onboardingData, error: onboardingError }, { data: companyData, error: companyError }] = await Promise.all([
        supabase
          .from("company_onboarding_data")
          .select("onboarding_completed, business_type, responsible_name, phone, commercial_email, city, state, employee_count, main_objective")
          .eq("company_id", currentProfile.company_id)
          .maybeSingle(),
        supabase
          .from("companies")
          .select("name, business_type, onboarding_status")
          .eq("id", currentProfile.company_id)
          .maybeSingle(),
      ]);
      if (onboardingError) throw onboardingError;
      if (companyError) throw companyError;

      const complete =
        onboardingData?.onboarding_completed === true &&
        Boolean(onboardingData.business_type || companyData?.business_type) &&
        Boolean(onboardingData.responsible_name) &&
        Boolean(onboardingData.phone) &&
        Boolean(onboardingData.commercial_email) &&
        Boolean(onboardingData.city) &&
        Boolean(onboardingData.state) &&
        Boolean(onboardingData.employee_count) &&
        Boolean(onboardingData.main_objective) &&
        companyData?.onboarding_status === "completed";

      return {
        status: complete ? "completed" : "pending",
        companyId: currentProfile.company_id,
      } as const;
    },
    enabled: !!profile?.company_id,
  });

  if (isProfileLoading || (profile?.company_id && isOnboardingLoading)) return <AuthPending />;

  // 1. Check if user is linked to a company
  if (!profile) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background p-4 text-center">
        <LaughLogo size={48} showWordmark />
        <div className="max-w-md space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex size-16 items-center justify-center rounded-full bg-gold/10 text-gold">
            <UserPlus className="size-8" />
          </div>
          <h1 className="text-2xl font-bold">Quase lá!</h1>
          <p className="text-muted-foreground">
            Sua conta foi criada, mas você ainda não foi vinculado a uma empresa ou cargo no sistema. 
            Entre em contato com o administrador para liberar seu acesso.
          </p>
          <div className="mt-4 p-4 rounded-lg bg-muted text-left text-xs space-y-2 border border-border/50">
            <p className="font-semibold text-gold">Instrução para o Administrador:</p>
            <p>Para vincular este usuário, acesse o <strong>Banco de Dados</strong> no painel de administração do sistema e siga estes passos:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Localize a tabela <code>public.profiles</code>.</li>
              <li>Encontre a linha com o e-mail deste usuário.</li>
              <li>Preencha a coluna <code>company_id</code> com o ID da empresa.</li>
              <li>Preencha a coluna <code>role_id</code> com o ID do cargo.</li>
            </ol>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <Button variant="outline" className="w-full gap-2" onClick={() => window.location.reload()}>
              Já fui liberado, atualizar
            </Button>
            <Button variant="ghost" className="w-full gap-2 text-muted-foreground" onClick={() => supabase.auth.signOut().then(() => window.location.href = "/auth")}>
              <LogOut className="size-4" /> Sair do sistema
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Check onboarding status for the company
  if (profile.company_id && onboarding?.status === 'pending') {
    return (
      <OnboardingWizard onComplete={() => queryClient.invalidateQueries({ queryKey: ["onboarding-status"] })} />
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}
