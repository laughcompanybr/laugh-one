import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { NAV_ITEMS } from "@/components/layout/nav-config";
import {
  BarChart3, BookOpen, CheckCircle2, ChevronLeft, ChevronRight, CircleHelp,
  LayoutDashboard, PlayCircle, Settings, Sparkles, Users, X,
} from "lucide-react";

const GUIDE_KEY = "laugh-one:product-guide:v1";

const FEATURE_DETAILS = [
  ["Dashboard", "Veja um resumo do negócio: indicadores, desempenho e informações importantes para decidir o que fazer.", LayoutDashboard],
  ["Pedidos", "Registre e acompanhe pedidos e vendas, seus itens, status e movimentações.", NAV_ITEMS.find((i) => i.moduleId === "orders")?.icon ?? BookOpen],
  ["Produtos e estoque", "Cadastre produtos, acompanhe estoque, preços e movimentações de entrada e saída.", NAV_ITEMS.find((i) => i.moduleId === "products")?.icon ?? BookOpen],
  ["Clientes", "Mantenha os clientes organizados e consulte o histórico relacionado ao negócio.", Users],
  ["Fornecedores", "Cadastre fornecedores e mantenha as informações de quem abastece sua empresa.", NAV_ITEMS.find((i) => i.moduleId === "suppliers")?.icon ?? BookOpen],
  ["Funcionários", "Organize a equipe e os dados de colaboradores, cargos e permissões.", NAV_ITEMS.find((i) => i.moduleId === "employees")?.icon ?? BookOpen],
  ["Financeiro", "Registre entradas e saídas e acompanhe a movimentação financeira.", NAV_ITEMS.find((i) => i.moduleId === "finance")?.icon ?? BookOpen],
  ["Relatórios", "Consulte informações consolidadas para entender resultados e acompanhar o negócio.", BarChart3],
  ["Automações", "Crie fluxos automáticos para reduzir tarefas repetitivas.", NAV_ITEMS.find((i) => i.moduleId === "automation")?.icon ?? Sparkles],
  ["Módulos e permissões", "Controle quais recursos ficam disponíveis e quem pode acessar cada área.", Settings],
  ["Histórico e auditoria", "Acompanhe alterações e atividades importantes realizadas no sistema.", NAV_ITEMS.find((i) => i.title === "Auditoria")?.icon ?? BookOpen],
  ["Assinatura", "Consulte o plano e as informações da sua assinatura.", NAV_ITEMS.find((i) => i.title === "Assinatura")?.icon ?? BookOpen],
  ["Configurações", "Atualize os dados da empresa e encontre novamente este tutorial sempre que quiser.", Settings],
] as const;

const TOUR_STEPS = [
  { title: "Bem-vindo ao Laugh One", text: "Este passeio rápido mostra onde encontrar cada recurso. Você pode avançar, voltar ou sair a qualquer momento.", icon: Sparkles },
  ...FEATURE_DETAILS.map(([title, text, icon]) => ({ title, text, icon })),
  { title: "Você está no controle", text: "Se precisar rever tudo, abra Configurações e clique em \"Repetir tutorial\". O sistema foi pensado para ser simples, previsível e acessível.", icon: CheckCircle2 },
];

export function ProductGuide() {
  const [userId, setUserId] = useState<string | null>(null);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (!userId) return;
    const key = `${GUIDE_KEY}:${userId}`;
    if (localStorage.getItem(key) !== "completed") {
      setStep(0);
      setTourOpen(true);
    }
  }, [userId]);

  const current = TOUR_STEPS[step];
  const Icon = current.icon;
  const percent = ((step + 1) / TOUR_STEPS.length) * 100;

  const finish = () => {
    if (userId) localStorage.setItem(`${GUIDE_KEY}:${userId}`, "completed");
    setTourOpen(false);
  };

  const restart = () => {
    setStep(0);
    setTourOpen(true);
  };

  useEffect(() => {
    const onRestart = () => restart();
    const onFeatures = () => setFeaturesOpen(true);
    window.addEventListener("laugh-one:restart-guide", onRestart);
    window.addEventListener("laugh-one:open-features", onFeatures);
    return () => {
      window.removeEventListener("laugh-one:restart-guide", onRestart);
      window.removeEventListener("laugh-one:open-features", onFeatures);
    };
  }, [userId]);

  return (
    <>
      <Dialog open={featuresOpen} onOpenChange={setFeaturesOpen}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto p-5 sm:p-8">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Sparkles className="size-6 text-gold" /> Tudo o que o Laugh One oferece
            </DialogTitle>
            <DialogDescription>
              Uma visão rápida, sem termos complicados, para você saber para que serve cada área.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURE_DETAILS.map(([title, text, FeatureIcon]) => (
              <div key={title} className="rounded-xl border border-border bg-muted/20 p-4 transition-colors hover:border-gold/40">
                <FeatureIcon className="mb-3 size-6 text-gold" aria-hidden="true" />
                <h3 className="font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:justify-between">
            <Button variant="outline" onClick={() => { setFeaturesOpen(false); restart(); }} className="min-h-11 gap-2">
              <PlayCircle className="size-4" /> Fazer o tutorial
            </Button>
            <Button onClick={() => setFeaturesOpen(false)} className="min-h-11">Entendi</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={tourOpen} onOpenChange={(open) => { if (!open) finish(); }}>
        <DialogContent
          className="max-w-2xl p-0 overflow-hidden"
          onEscapeKeyDown={(e) => { e.preventDefault(); finish(); }}
        >
          <div className="p-6 sm:p-8">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gold">Tutorial Laugh One</p>
                <p className="mt-1 text-sm text-muted-foreground">Passo {step + 1} de {TOUR_STEPS.length}</p>
              </div>
              <Button variant="ghost" size="icon" className="size-11" onClick={finish} aria-label="Sair do tutorial">
                <X className="size-5" />
              </Button>
            </div>
            <Progress value={percent} className="mb-8 h-3" aria-label={`Progresso do tutorial: ${Math.round(percent)}%`} />
            <div className="rounded-2xl border bg-muted/20 p-6 sm:p-8">
              <Icon className="mb-5 size-10 text-gold" aria-hidden="true" />
              <h2 className="text-2xl font-bold sm:text-3xl">{current.title}</h2>
              <p className="mt-3 text-base leading-7 text-muted-foreground sm:text-lg">{current.text}</p>
            </div>
            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
              <Button variant="ghost" className="min-h-11" onClick={finish}>Pular tutorial</Button>
              <div className="flex gap-2">
                <Button variant="outline" className="min-h-11" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
                  <ChevronLeft className="mr-1 size-4" /> Voltar
                </Button>
                {step < TOUR_STEPS.length - 1 ? (
                  <Button className="min-h-11" onClick={() => setStep((s) => s + 1)}>
                    Próximo <ChevronRight className="ml-1 size-4" />
                  </Button>
                ) : (
                  <Button className="min-h-11" onClick={finish}>
                    <CheckCircle2 className="mr-1 size-4" /> Concluir
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function openProductFeatures() {
  window.dispatchEvent(new Event("laugh-one:open-features"));
}

export function restartProductGuide() {
  window.dispatchEvent(new Event("laugh-one:restart-guide"));
}
