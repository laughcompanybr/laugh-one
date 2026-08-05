import { Link, useRouterState } from "@tanstack/react-router";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { LaughLogo } from "@/components/brand/LaughLogo";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { NAV_ITEMS, type NavItem } from "./nav-config";
import { useUserRole } from "@/domains/auth/hooks/use-user-role";
import { useModules } from "@/domains/tenants/hooks/use-modules";
import { ShieldAlert } from "lucide-react";

const GROUP_LABELS: Record<NavItem["group"], string> = {
  operação: "Operação",
  gestão: "Gestão",
  sistema: "Sistema",
};

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const { isSuperAdmin } = useUserRole();

  const { isModuleEnabled } = useModules();

  const groups = (["operação", "gestão", "sistema"] as const).map((group) => ({
    group,
    items: NAV_ITEMS.filter((i) => i.group === group && isModuleEnabled(i.moduleId)),
  }));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border px-3 py-4">
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href="https://laughone.com.br/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visitar site oficial da Laugh One"
                className="inline-flex rounded-md outline-none transition-all duration-200 hover:opacity-80 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar cursor-pointer"
              >
                <LaughLogo size={32} showWordmark={!collapsed} />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right" className="hidden md:block">
              Visitar site oficial da Laugh One
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </SidebarHeader>
      <SidebarContent className="gap-1 px-2 py-3">
        {groups.map(({ group, items }) => (
          <SidebarGroup key={group}>
            {!collapsed ? (
              <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/70">
                {GROUP_LABELS[group]}
              </SidebarGroupLabel>
            ) : null}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const active =
                    currentPath === item.to || currentPath.startsWith(item.to + "/");
                  return (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.title}
                        className="h-10 rounded-lg data-[active=true]:bg-sidebar-accent data-[active=true]:text-gold"
                      >
                        <Link to={item.to} className="flex items-center gap-3">
                          <item.icon className="size-4 shrink-0" />
                          {!collapsed && <span className="text-sm">{item.title}</span>}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}

        {isSuperAdmin && (
          <SidebarGroup>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold/80">
                Super Admin
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    isActive={currentPath.startsWith("/admin")}
                    tooltip="Painel Super Admin"
                    className="h-10 rounded-lg data-[active=true]:bg-gold/10 data-[active=true]:text-gold"
                  >
                    <Link to="/admin" className="flex items-center gap-3">
                      <ShieldAlert className="size-4 shrink-0" />
                      {!collapsed && <span className="text-sm">Painel Super Admin</span>}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
