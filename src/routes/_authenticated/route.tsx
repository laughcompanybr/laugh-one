import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Loader2, UserPlus, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/layout/AppShell";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getProfile } from "@/domains/auth/services/AuthService";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    // getSession() reads from localStorage synchronously (no network round-trip),
    // so the gate resolves instantly on subsequent navigations and the
    // pending component never flashes between sections.
    const { data } = await supabase.auth.getSession();
    if (!data.session?.user) throw redirect({ to: "/auth" });
    // Enforce AAL2 whenever the account has a verified TOTP factor.
    // nextLevel === "aal2" means the current session is only aal1 but the
    // account has enrolled MFA — send the user to /mfa-verify.
    const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2") {
      throw redirect({ to: "/mfa-verify" });
    }
    return { user: data.session.user };
  },
  pendingComponent: AuthPending,
  // Only show pending UI if the check somehow takes longer than 800ms
  // (first load with cold localStorage). Section-to-section nav stays silent.
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
  const { data: profile, isLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: () => getProfile(),
  });

  if (isLoading) return <AuthPending />;

  // Se o usuário está logado mas não tem perfil (não vinculado a empresa/cargo)
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
          <div className="flex flex-col gap-3 pt-4">
            <Button 
              variant="outline" 
              className="w-full gap-2"
              onClick={() => window.location.reload()}
            >
              Já fui liberado, atualizar
            </Button>
            <Button 
              variant="ghost" 
              className="w-full gap-2 text-muted-foreground"
              onClick={() => supabase.auth.signOut().then(() => window.location.href = "/auth")}
            >
              <LogOut className="size-4" /> Sair do sistema
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AppShell>
      <Outlet />
    </AppShell>
  );
}


