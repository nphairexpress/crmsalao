import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Calendar,
  DollarSign,
  Package,
  Sparkles,
  Users,
  Megaphone,
  BarChart3,
  Settings,
  CreditCard,
} from "lucide-react";

interface NavItem {
  title: string;
  url: string;
  icon: React.ElementType;
  subItems?: { title: string; url: string }[];
}

const navItems: NavItem[] = [
  { 
    title: "Agenda", 
    url: "/agenda", 
    icon: Calendar,
    subItems: [
      { title: "Agenda", url: "/agenda" },
      { title: "Atendimento em Casa", url: "/agenda/atendimento-casa" },
    ]
  },
  { 
    title: "Financeiro", 
    url: "/financeiro", 
    icon: DollarSign,
    subItems: [
      { title: "Caixas Abertos", url: "/financeiro" },
      { title: "Histórico de Caixas", url: "/financeiro/historico" },
      { title: "Comandas Abertas", url: "/comandas" },
      { title: "Comandas Finalizadas", url: "/comandas/finalizadas" },
      { title: "Comissões", url: "/financeiro/comissoes" },
      { title: "Entradas e Saídas", url: "/financeiro/entradas-saidas" },
      { title: "Notas Fiscais", url: "/financeiro/notas" },
    ]
  },
  { 
    title: "Estoque", 
    url: "/estoque", 
    icon: Package,
    subItems: [
      { title: "Produtos", url: "/estoque" },
      { title: "Fornecedores", url: "/estoque/fornecedores" },
      { title: "Pedidos de Compra", url: "/estoque/pedidos" },
      { title: "Inventário", url: "/estoque/inventario" },
      { title: "Solicitações de Saída", url: "/estoque/solicitacoes" },
    ]
  },
  { 
    title: "IA", 
    url: "/ia", 
    icon: Sparkles,
  },
  { 
    title: "Clientes", 
    url: "/clientes", 
    icon: Users,
    subItems: [
      { title: "Cadastros", url: "/clientes" },
      { title: "Aniversariantes", url: "/clientes/aniversariantes" },
      { title: "Segmentação", url: "/clientes/segmentacao" },
    ]
  },
  { 
    title: "Marketing", 
    url: "/marketing", 
    icon: Megaphone,
    subItems: [
      { title: "Campanhas", url: "/marketing" },
      { title: "WhatsApp", url: "/marketing/whatsapp" },
      { title: "Email", url: "/marketing/email" },
    ]
  },
  { 
    title: "Relatórios", 
    url: "/relatorios", 
    icon: BarChart3,
    subItems: [
      { title: "Vendas", url: "/relatorios" },
      { title: "Serviços", url: "/relatorios/servicos" },
      { title: "Profissionais", url: "/relatorios/profissionais" },
      { title: "Clientes", url: "/relatorios/clientes" },
      { title: "Produtos", url: "/relatorios/produtos" },
      { title: "Comissões", url: "/relatorios/comissoes" },
    ]
  },
  { 
    title: "Configurações", 
    url: "/configuracoes", 
    icon: Settings,
    subItems: [
      { title: "Geral", url: "/configuracoes" },
      { title: "Serviços", url: "/servicos" },
      { title: "Profissionais", url: "/profissionais" },
      { title: "Horários", url: "/configuracoes/horarios" },
      { title: "Integrações", url: "/configuracoes/integracoes" },
    ]
  },
  { 
    title: "Pagamentos", 
    url: "/pagamentos", 
    icon: CreditCard,
  },
];

export function TopNavigation() {
  const location = useLocation();
  const navigate = useNavigate();

  // Find active nav item based on current path
  const activeNavItem = navItems.find(item => {
    if (location.pathname === item.url) return true;
    if (item.subItems) {
      return item.subItems.some(sub => location.pathname.startsWith(sub.url));
    }
    return location.pathname.startsWith(item.url);
  });

  return (
    <div className="border-b border-border bg-card">
      {/* Main navigation */}
      <nav className="flex items-center justify-center gap-1 px-4 py-2">
        {navItems.map((item) => {
          const isActive = activeNavItem?.url === item.url;
          const Icon = item.icon;
          
          return (
            <button
              key={item.url}
              onClick={() => navigate(item.url)}
              className={cn(
                "flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-all duration-200 min-w-[80px]",
                "hover:bg-primary/10 hover:text-primary",
                isActive && "text-primary border-b-2 border-primary bg-primary/5"
              )}
            >
              <Icon className={cn(
                "h-6 w-6 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )} />
              <span className={cn(
                "text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
            </button>
          );
        })}
      </nav>

      {/* Sub navigation */}
      {activeNavItem?.subItems && (
        <div className="flex items-center gap-1 px-4 py-1 bg-muted/30 border-t border-border">
          {activeNavItem.subItems.map((subItem) => {
            const isSubActive = location.pathname === subItem.url;
            
            return (
              <button
                key={subItem.url}
                onClick={() => navigate(subItem.url)}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-colors",
                  isSubActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {subItem.title}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
