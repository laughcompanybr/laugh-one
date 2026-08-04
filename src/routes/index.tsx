import { createFileRoute } from "@tanstack/react-router";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, Database, Zap } from "lucide-react";

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
        <div className="max-w-3xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold tracking-widest uppercase">
            <Zap className="size-3" /> Segurança & Automação de Perfil
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Infraestrutura <span className="text-gold italic">Blindada</span> e Sincronizada.
          </h1>
          
          <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
            Realizamos uma auditoria completa no Laugh One. Agora, cada novo usuário provisionado é automaticamente vinculado à estrutura de cargos e empresas via banco de dados, com RLS reforçado.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-colors group">
              <ShieldCheck className="size-8 text-gold mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">Sync Automático</h3>
              <p className="text-sm text-white/50 leading-relaxed">Novo trigger "handle_new_user" que vincula automaticamente usuários auth.users a perfis e cargos internos.</p>
            </div>
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-gold/30 transition-colors group">
              <UserCheck className="size-8 text-gold mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-bold mb-2">RBAC de Próxima Geração</h3>
              <p className="text-sm text-white/50 leading-relaxed">Políticas RLS corrigidas para permitir que usuários vejam apenas dados de sua própria empresa de forma nativa no DB.</p>
            </div>
          </div>

          <div className="pt-12">
            <Link to="/dashboard">
              <Button size="lg" className="h-14 px-10 bg-gold hover:bg-gold/90 text-black font-bold text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                Acessar Painel de Controle
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
