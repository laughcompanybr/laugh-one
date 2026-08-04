import {
  LayoutDashboard,
  Users,
  Truck,
  Package,
  Wallet,
  FileBarChart,
  Settings,
  UsersRound,
  Paperclip,
  Boxes,
  LayoutGrid,
  Shield,
  Activity,
  type LucideIcon,
} from "lucide-react";


export interface NavItem {
  title: string;
  to: string;
  icon: LucideIcon;
  group: "operação" | "gestão" | "sistema";
  moduleId: string;
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard, group: "operação", moduleId: "dashboard" },
  { title: "Pedidos", to: "/pedidos", icon: Package, group: "operação", moduleId: "orders" },
  { title: "Produtos", to: "/produtos", icon: Boxes, group: "operação", moduleId: "products" },
  { title: "Clientes", to: "/clientes", icon: Users, group: "gestão", moduleId: "clients" },
  { title: "Fornecedores", to: "/fornecedores", icon: Truck, group: "gestão", moduleId: "suppliers" },
  { title: "Funcionários", to: "/funcionarios", icon: UsersRound, group: "gestão", moduleId: "employees" },
  { title: "Financeiro", to: "/financeiro", icon: Wallet, group: "gestão", moduleId: "finance" },
  { title: "Anexos", to: "/anexos", icon: Paperclip, group: "gestão", moduleId: "attachments" },
  { title: "Relatórios", to: "/relatorios", icon: FileBarChart, group: "gestão", moduleId: "reports" },
  { title: "Módulos", to: "/modulos", icon: LayoutGrid, group: "sistema", moduleId: "settings" },
  { title: "Cargos e Permissões", to: "/cargos", icon: Shield, group: "sistema", moduleId: "settings" },
  { title: "Auditoria", to: "/auditoria", icon: Activity, group: "sistema", moduleId: "settings" },
  { title: "Configurações", to: "/configuracoes", icon: Settings, group: "sistema", moduleId: "settings" },

];
