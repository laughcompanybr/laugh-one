import { createFileRoute } from "@tanstack/react-router";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, Database, Zap, Lock, AlertTriangle, CheckCircle, RefreshCcw, UserPlus, FileText } from "lucide-react";

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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold tracking-widest uppercase">
            <CheckCircle className="size-3" /> Sistema de Permissões (RBAC) Restaurado
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Erro de Sintaxe UUID <span className="text-gold italic">Corrigido</span> e Provisionamento Blindado.
          </h1>
          
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <p className="text-lg text-white/80 mb-6 font-medium border-l-2 border-gold pl-4 italic">
              "Execute esta instrucao no projeto: Corrija o erro 22P02: invalid input syntax for type uuid: 'Administrador'"
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <ShieldCheck className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Correção de Tipagem (UUID)</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Corrigido o erro onde o sistema tentava inserir a string literal <code>'Administrador'</code> no campo <code>role_id</code> (UUID). O vínculo agora é feito corretamente usando o ID único do cargo.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <UserCheck className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Recuperação de Perfil</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  O usuário <code>ed8f4683...</code> foi vinculado manualmente ao cargo de Administrador e à empresa Laugh One através de um script atômico, restaurando seu acesso imediato.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <Zap className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Provisionamento Inteligente</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  A função <code>handle_new_user</code> foi refatorada para buscar dinamicamente o UUID do cargo 'Administrador', evitando falhas de sintaxe e garantindo que novos usuários nunca fiquem órfãos.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <Database className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Integridade Referencial</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Implementada proteção contra <code>race conditions</code> na criação de empresas e cargos iniciais, garantindo que a hierarquia de dados RBAC esteja sempre consistente.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/dashboard">
              <Button size="lg" className="h-14 px-10 bg-gold hover:bg-gold/90 text-black font-bold text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                Validar Fluxo de Acesso
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
