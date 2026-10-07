import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Accessibility, LogOut, Search, User as UserIcon, Minus, Plus, PlayCircle, CircleHelp } from "lucide-react";
import { toast } from "sonner";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { CommandPalette } from "./CommandPalette";
import { Breadcrumbs } from "./Breadcrumbs";
import { ThemeToggle } from "@/components/common/ThemeToggle";

export function AppTopbar({ userEmail }: { userEmail: string }) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [fontScale, setFontScale] = useState(1);
  const [reducedMotion, setReducedMotion] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const initials = userEmail.slice(0, 2).toUpperCase();

  const applyAccessibility = (scale: number, motion: boolean) => {
    const safeScale = Math.min(1.25, Math.max(1, scale));
    document.documentElement.style.fontSize = `${safeScale * 100}%`;
    document.documentElement.classList.toggle("reduce-motion", motion);
    setFontScale(safeScale);
    setReducedMotion(motion);
    localStorage.setItem("laugh-one:font-scale", String(safeScale));
    localStorage.setItem("laugh-one:reduced-motion", String(motion));
  };

  useEffect(() => {
    const storedScale = Number(localStorage.getItem("laugh-one:font-scale") || "1");
    const storedMotion = localStorage.getItem("laugh-one:reduced-motion") === "true";
    const safeScale = Math.min(1.25, Math.max(1, Number.isFinite(storedScale) ? storedScale : 1));
    setFontScale(safeScale);
    setReducedMotion(storedMotion);
    document.documentElement.style.fontSize = `${safeScale * 100}%`;
    document.documentElement.classList.toggle("reduce-motion", storedMotion);
  }, []);

  useEffect(() => {
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [fontScale, reducedMotion]);

  const handleSignOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate({ to: "/auth", replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="mx-2 hidden h-5 w-px bg-border md:block" />
      <Breadcrumbs />
      <button
        onClick={() => setPaletteOpen(true)}
        className="group ml-auto hidden h-9 w-full max-w-xs items-center gap-2 rounded-lg border border-border bg-secondary/40 px-3 text-left text-sm text-muted-foreground transition-colors hover:border-gold/40 hover:bg-secondary md:flex lg:max-w-sm"
      >
        <Search className="size-4" />
        <span className="flex-1 truncate">Buscar…</span>
        <kbd className="rounded border border-border bg-background/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
          ⌘K
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-1 md:ml-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setPaletteOpen(true)}
          aria-label="Buscar"
          className="h-9 w-9 text-muted-foreground md:hidden"
        >
          <Search className="size-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="Acessibilidade">
              <Accessibility className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Acessibilidade</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-2">
              <p className="mb-2 text-xs text-muted-foreground">Tamanho do texto</p>
              <div className="flex gap-2">
                <Button variant="outline" className="min-h-10 flex-1" onClick={() => applyAccessibility(fontScale - 0.125, reducedMotion)} disabled={fontScale <= 1}><Minus className="size-4" /> Menor</Button>
                <Button variant="outline" className="min-h-10 flex-1" onClick={() => applyAccessibility(1, reducedMotion)}>Normal</Button>
                <Button variant="outline" className="min-h-10 flex-1" onClick={() => applyAccessibility(fontScale + 0.125, reducedMotion)} disabled={fontScale >= 1.25}><Plus className="size-4" /> Maior</Button>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => applyAccessibility(fontScale, !reducedMotion)}>
              <PlayCircle className="mr-2 size-4" /> {reducedMotion ? "Ativar animações" : "Reduzir animações"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.dispatchEvent(new Event("laugh-one:restart-guide"))}>
              <CircleHelp className="mr-2 size-4" /> Repetir tutorial
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <Avatar className="size-7">
                <AvatarFallback className="bg-secondary text-[11px] text-gold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-sm text-muted-foreground md:inline">
                {userEmail}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {userEmail}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate({ to: "/configuracoes" })}>
              <UserIcon className="mr-2 size-4" /> Perfil e preferências
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
              <LogOut className="mr-2 size-4" /> Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
