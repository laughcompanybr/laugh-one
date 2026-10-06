import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Command } from "cmdk";
import {
  Activity,
  BarChart3,
  Boxes,
  CalendarDays,
  Command as CommandIcon,
  FileBarChart,
  History,
  LayoutDashboard,
  LayoutGrid,
  Search,
  Settings,
  Shield,
  ShoppingCart,
  Truck,
  Users,
  UsersRound,
  Wallet,
  Zap,
} from "lucide-react";
import { NAV_ITEMS } from "@/components/layout/nav-config";

const ICONS = {
  dashboard: LayoutDashboard,
  orders: ShoppingCart,
  products: Boxes,
  clients: Users,
  suppliers: Truck,
  employees: UsersRound,
  finance: Wallet,
  reports: FileBarChart,
  automation: Zap,
  settings: Settings,
} as const;

const EXTRA_ACTIONS = [
  { label: "Mensais", to: "/mensais", keywords: "mensal calendário fechamento", icon: CalendarDays },
  { label: "Histórico", to: "/historico", keywords: "histórico alterações", icon: History },
  { label: "Auditoria", to: "/auditoria", keywords: "auditoria segurança logs", icon: Activity },
  { label: "Módulos", to: "/modulos", keywords: "módulos recursos", icon: LayoutGrid },
  { label: "Cargos e Permissões", to: "/cargos", keywords: "cargos permissões acesso rbac", icon: Shield },
  { label: "Relatórios", to: "/relatorios", keywords: "relatórios indicadores exportar", icon: BarChart3 },
] as const;

export function GlobalCommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === "k" || event.key === "/")) {
        event.preventDefault();
        setOpen((value) => !value);
      }
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const items = useMemo(() => {
    const nav = NAV_ITEMS.map((item) => {
      const Icon = ICONS[item.moduleId as keyof typeof ICONS] ?? Search;
      return {
        label: item.title,
        to: item.to,
        keywords: item.title.toLowerCase(),
        icon: Icon,
      };
    });

    return [...nav, ...EXTRA_ACTIONS].filter(
      (item, index, list) => list.findIndex((candidate) => candidate.to === item.to) === index,
    );
  }, []);

  const go = (to: string) => {
    setOpen(false);
    void navigate({ to: to as never });
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Abrir busca rápida"
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-full border border-border/70 bg-background/90 px-4 py-2 text-xs font-medium text-muted-foreground shadow-xl backdrop-blur-md transition hover:border-gold/40 hover:text-foreground md:flex"
      >
        <CommandIcon className="size-3.5" />
        Busca rápida
        <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center bg-black/60 px-4 pt-[12vh] backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Busca rápida do Laugh One"
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <Command label="Busca rápida" loop>
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="size-5 text-muted-foreground" />
                <Command.Input
                  autoFocus
                  placeholder="Ir para uma área, relatório ou configuração..."
                  className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
                <kbd className="rounded border border-border px-2 py-1 text-[10px] text-muted-foreground">ESC</kbd>
              </div>

              <Command.List className="max-h-[55vh] overflow-y-auto p-2">
                <Command.Empty className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nenhum resultado encontrado.
                </Command.Empty>

                <Command.Group heading="Navegação" className="px-1 pb-2 text-xs text-muted-foreground [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
                  {items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Command.Item
                        key={item.to}
                        value={item.label + " " + item.keywords}
                        onSelect={() => go(item.to)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-sm outline-none transition data-[selected=true]:bg-accent data-[selected=true]:text-foreground"
                      >
                        <span className="flex size-9 items-center justify-center rounded-lg bg-muted text-gold">
                          <Icon className="size-4" />
                        </span>
                        <span className="font-medium">{item.label}</span>
                      </Command.Item>
                    );
                  })}
                </Command.Group>
              </Command.List>

              <div className="flex items-center justify-between border-t border-border bg-muted/30 px-4 py-2 text-[11px] text-muted-foreground">
                <span>Atalho global do Laugh One</span>
                <span>↑ ↓ navegar · Enter abrir</span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
