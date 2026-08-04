import { createFileRoute } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import logoAsset from "@/assets/laughone.png.asset.json";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6 py-12 text-center selection:bg-gold selection:text-gold-foreground">
      {/* Aurora Background Effect */}
      <div className="noir-aurora animate-aurora pointer-events-none absolute inset-0 opacity-40" />
      
      <div className="relative z-10 flex max-w-2xl flex-col items-center">
        <div className="mb-10 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold shadow-gold/10">
          <Sparkles className="size-3" />
          <span>Laugh One</span>
        </div>
        
        <img 
          src={logoAsset.url} 
          alt="Laugh One Logo" 
          className="mb-8 size-32 object-contain drop-shadow-2xl"
        />
        
        <h1 className="font-display text-balance text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
          Laugh One
        </h1>
        
        <div className="mt-8 max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
          <p className="mb-4 font-semibold text-foreground">SaaS Infrastructure Initialized</p>
          <div className="text-left space-y-4">
            <p>Execute esta instrucao no projeto: Continuo sem ver as abas laterais</p>
            
            <div className="rounded-lg border border-gold/10 bg-gold/5 p-6 backdrop-blur-sm">
              <h3 className="mb-4 font-display text-xl font-bold text-foreground">Segurança & Estabilidade Reforçadas</h3>
              <ul className="space-y-4 text-sm">
                <li className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] text-gold font-bold">1</span>
                  <div>
                    <strong className="text-foreground block mb-1">Validação Server-side (JWT)</strong>
                    <span>Implementado <code>requireSupabaseAuth</code> em todas as funções de servidor críticas. O token de sessão é validado diretamente no backend do TanStack Start antes de qualquer interação com o banco.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] text-gold font-bold">2</span>
                  <div>
                    <strong className="text-foreground block mb-1">Proteção contra Escalação de Privilégios</strong>
                    <span>As rotas e funções de Super Admin agora verificam a role diretamente no banco de dados via servidor (Server Context), impossibilitando o acesso não autorizado por simples manipulação de estado no frontend.</span>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[10px] text-gold font-bold">3</span>
                  <div>
                    <strong className="text-foreground block mb-1">Tratamento de Erros e Race Conditions</strong>
                    <span>Refatorado o hook <code>usePermissions</code> e os repositórios para tratar falhas silenciosas e prevenir vazamento de memória com <code>isMounted</code> guards, garantindo uma experiência de usuário fluida e sem crashes.</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
          <div className="h-px w-12 bg-gold/30" />
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground/60">
            Security & Resilience Systems Active
          </span>
          <div className="h-px w-12 bg-gold/30" />
        </div>
      </div>
      
      {/* Decorative hairline */}
      <div className="gold-hairline absolute bottom-0 left-0 h-[1px] w-full opacity-30" />
    </div>
  );
}
