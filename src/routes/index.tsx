import { createFileRoute } from "@tanstack/react-router";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShieldCheck, UserCheck, Database, Zap, Lock, AlertTriangle, CheckCircle, RefreshCcw, UserPlus, FileText, Activity, Calendar, TrendingUp } from "lucide-react";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-gold/30 antialiased">
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

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-bold tracking-widest uppercase">
            <ShieldCheck className="size-3" /> Laugh One — SaaS Multi-Tenant Professional
          </div>
          
          <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tight leading-[0.95]">
            Laugh One
          </h1>
          <p className="text-2xl text-gold font-medium mb-4 italic">
            "Tecnologia criada para negócios que evoluem."
          </p>

          
          <p className="text-xl text-white/70 max-w-xl leading-relaxed font-light">
            Uma plataforma de gestão empresarial de elite, desenhada para escalar operações com precisão, inteligência e um design superior.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to="/auth">
              <Button size="lg" className="h-14 px-10 bg-gold hover:bg-gold/90 text-black font-bold text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                Acessar Plataforma
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-10 border-white/10 hover:bg-white/5 text-white font-medium text-lg">
              Conhecer Soluções
            </Button>
          </div>
          
          <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 border-t border-white/5 pt-12">
            <div className="group space-y-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/20 transition-all duration-300">
              <Zap className="size-8 text-gold" />
              <h3 className="font-display font-semibold text-lg">Performance Premium</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Arquitetura SaaS otimizada para máxima velocidade e experiência de usuário fluida.
              </p>
            </div>
            <div className="group space-y-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/20 transition-all duration-300">
              <UserCheck className="size-8 text-gold" />
              <h3 className="font-display font-semibold text-lg">Inteligência Multi-Tenant</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Isolamento total de dados com segurança rigorosa, garantindo soberania para cada operação.
              </p>
            </div>
            <div className="group space-y-4 p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-gold/20 transition-all duration-300">
              <Database className="size-8 text-gold" />
              <h3 className="font-display font-semibold text-lg">Design White Label</h3>
              <p className="text-sm text-white/50 leading-relaxed">
                Identidade corporativa sob medida: adaptabilidade total para sua marca brilhar.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 border-t border-white/5 bg-black/40 py-12 px-6 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-white/40">
          <div className="flex items-center gap-2">
            <LaughLogo size={24} />
            <span>&copy; {new Date().getFullYear()} Laugh One. Desenvolvido por <span className="text-white/60">Laugh Company</span>.</span>
          </div>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Termos</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
            <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
