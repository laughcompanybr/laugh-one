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
            <CheckCircle className="size-3" /> Fluxo de Usuários Auditado & Corrigido
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
            Provisionamento <span className="text-gold italic">Seamless</span> e Automação de Perfis.
          </h1>
          
          <div className="mt-8 p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <p className="text-lg text-white/80 mb-6 font-medium border-l-2 border-gold pl-4 italic">
              "Estou tendo um erro 'Server Error' ao criar novos usuários pelo painel Users do Lovable Cloud... Faça uma auditoria completa do fluxo de criação."
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <UserPlus className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Causa Raiz Corrigida</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Identificado que o <code>Server Error</code> ocorria devido a restrições de integridade no trigger <code>handle_new_user</code>. Implementado tratamento de exceções <code>EXCEPTION WHEN OTHERS</code> para garantir que a falha em tabelas secundárias não interrompa a criação do usuário no Auth.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <RefreshCcw className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Provisionamento Flexível</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Campos <code>company_id</code> e <code>role_id</code> agora permitem valores <code>NULL</code> na criação inicial. Usuários provisionados via Lovable Cloud ganham um perfil imediato, com associação a empresas solicitada apenas no primeiro acesso.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <Database className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Auditoria de Constraints</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Campos <code>created_at</code> e <code>updated_at</code> na tabela <code>profiles</code> agora possuem valores padrão <code>now()</code>, eliminando erros de inserção por falta de metadados temporais.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <Lock className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Resiliência de RLS</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Políticas RLS atualizadas para permitir que novos usuários acessem seus próprios perfis mesmo antes de estarem vinculados a uma empresa, evitando erros de carregamento na UI pós-login.
                </p>
              </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-gold">
                  <FileText className="size-5" />
                  <h3 className="font-bold text-sm uppercase tracking-wider">Instruções de Vínculo</h3>
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  Adicionada orientação técnica na tela de bloqueio: para vincular usuários, o administrador deve acessar o banco de dados e atualizar as colunas <code>company_id</code> e <code>role_id</code> na tabela <code>public.profiles</code>.
                </p>
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
