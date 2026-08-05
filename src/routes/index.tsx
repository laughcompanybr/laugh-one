import { createFileRoute, Link } from "@tanstack/react-router";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { Button } from "@/components/ui/button";
import { Zap, Database, ShieldCheck, ChevronRight, BarChart3, Users, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  component: LandingPage,
});

function LandingPage() {
  const segments = [
    "Barbearias", "Salões de beleza", "Joalherias", "Lojas", "Restaurantes", 
    "Deliverys", "Clínicas", "Academias", "Imobiliárias", "Oficinas", 
    "Pet Shops", "Escolas", "Agências", "Construtoras"
  ];

  return (
    <div className="min-h-screen bg-[#020202] text-white selection:bg-gold/30 antialiased font-sans">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-gold/5 blur-[150px] rounded-full animate-pulse" />
      </div>

      <nav className="relative z-50 border-b border-white/5 bg-black/40 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <LaughLogo size={32} showWordmark />
          <div className="flex items-center gap-4">
            <Link to="/auth">
              <Button variant="ghost" className="text-white/70 hover:text-white">Entrar</Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gold hover:bg-gold/90 text-black font-bold px-6">Começar agora</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32 space-y-32">
        {/* Hero Section */}
        <section className="text-center space-y-8">
          <Badge variant="outline" className="border-gold/30 text-gold bg-gold/5 py-1 px-4">
            Laugh One — Tecnologia criada para negócios que evoluem.
          </Badge>
          <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tight leading-[0.9] max-w-4xl mx-auto">
            Gestão inteligente para <span className="text-gold-shine">seu negócio</span>.
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto font-light leading-relaxed">
            Uma plataforma de gestão empresarial que se adapta ao seu segmento, automatiza processos e centraliza sua operação em um único lugar.
          </p>
          <div className="flex justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="h-14 px-10 bg-gold hover:bg-gold/90 text-black font-bold text-lg shadow-[0_0_30px_rgba(212,175,55,0.3)]">
                Começar agora
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-14 px-10 border-white/10 hover:bg-white/5 text-white font-medium text-lg">
              Conhecer funcionalidades
            </Button>
          </div>
        </section>

        {/* Product Explanation */}
        <section className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <h2 className="text-4xl font-display font-medium tracking-tight">O sistema que se <span className="text-gold">adapta</span> ao seu negócio.</h2>
            <p className="text-white/60 text-lg leading-relaxed font-light">
              Não tente forçar seu negócio a caber em um software genérico. O Laugh One personaliza módulos, terminologias e fluxos de acordo com o seu segmento de mercado. Seja uma barbearia ou uma joalheria, a plataforma se molda à sua operação.
            </p>
          </div>
          <div className="bento-tile p-8 aspect-video flex items-center justify-center">
            <p className="text-gold/50 italic tracking-widest uppercase text-sm">Preview do Dashboard SaaS</p>
          </div>
        </section>

        {/* Segments */}
        <section className="space-y-10">
          <h2 className="text-center text-3xl font-display font-medium">Segmentos atendidos</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {segments.map((segment) => (
              <div key={segment} className="p-4 rounded-xl bg-white/5 border border-white/5 text-center text-sm text-white/70 hover:border-gold/30 hover:bg-white/10 transition-all">
                {segment}
              </div>
            ))}
          </div>
        </section>

        {/* Functionalities */}
        <section className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Users, title: "Gestão de Clientes", desc: "Histórico completo e relacionamento inteligente." },
            { icon: BarChart3, title: "Financeiro", desc: "Entradas, saídas e relatórios em tempo real." },
            { icon: Briefcase, title: "Pedidos e Vendas", desc: "Controle total de status e fluxo de vendas." },
            { icon: Zap, title: "Automação", desc: "Processos manuais automatizados pelo sistema." },
            { icon: Database, title: "Multi-tenant", desc: "Ambiente isolado, seguro e exclusivo para você." },
            { icon: ShieldCheck, title: "Escalabilidade", desc: "Tecnologia moderna feita para seu crescimento." },
          ].map((feat) => (
            <div key={feat.title} className="bento-tile p-6 space-y-4">
              <feat.icon className="size-8 text-gold" />
              <h3 className="font-display font-semibold text-lg">{feat.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA Section */}
        <section className="bento-tile p-16 text-center space-y-8 bg-gold/5">
          <h2 className="text-4xl font-display font-medium tracking-tight">Transforme a gestão da sua empresa.</h2>
          <p className="text-white/60 text-lg">Pronto para evoluir com o Laugh One?</p>
          <Link to="/auth">
            <Button size="lg" className="h-14 px-10 bg-gold hover:bg-gold/90 text-black font-bold text-lg">
              Começar agora
            </Button>
          </Link>
        </section>
      </main>

      <footer className="border-t border-white/5 bg-black/40 py-12 text-center text-sm text-white/40">
        <p>&copy; {new Date().getFullYear()} Laugh One — Tecnologia criada para negócios que evoluem.</p>
      </footer>
    </div>
  );
}
