import { createFileRoute } from "@tanstack/react-router";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, Database, Zap, Lock, AlertTriangle, CheckCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-gold/30">
      {/* Aurora Background Effect */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-gold/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] bg-orange-500/5 blur-[100px] rounded-full" />
      </div>

      <nav className="relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <LaughLogo size={32} showWordmark />
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gold hover:bg-gold/90 text-black font-bold px-6">Começar Agora</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold tracking-widest uppercase">
            <Zap className="size-3" /> Auditoria de Segurança Concluída
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Resiliência <span className="text-gold italic">Operacional</span> & Segurança de Dados.
          </h1>
          
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <p className="text-lg text-white/80 mb-6 font-medium border-l-2 border-gold pl-4">
              "Analise o código, identifique bugs e vulnerabilidades de segurança. Corrija-os aplicando tratamento de erros robusto e explique as melhorias."
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gold">
                  <Lock className="size-4" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Segurança JWT</h3>
                </div>
                <p className="text-sm text-white/50">Middleware de autenticação agora valida tokens server-side em todas as funções críticas, impedindo bypass de frontend.</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gold">
                  <AlertTriangle className="size-4" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Data Integrity</h3>
                </div>
                <p className="text-sm text-white/50">Substituição de <code>.single()</code> por <code>.maybeSingle()</code> e validação Zod rigorosa eliminando crashes por dados nulos ou inesperados.</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gold">
                  <CheckCircle className="size-4" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Sync de Perfil</h3>
                </div>
                <p className="text-sm text-white/50">Trigger de banco de dados garante que novos usuários Auth sejam automaticamente provisionados com perfis e cargos RBAC.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="h-14 px-10 bg-gold hover:bg-gold/90 text-black font-bold text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                Acessar Sistema Seguro
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
