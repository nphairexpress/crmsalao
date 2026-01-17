import { Calendar, UserPlus, Receipt, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  {
    icon: Calendar,
    label: "Novo Agendamento",
    description: "Agendar atendimento",
    variant: "default" as const,
  },
  {
    icon: UserPlus,
    label: "Novo Cliente",
    description: "Cadastrar cliente",
    variant: "outline" as const,
  },
  {
    icon: Receipt,
    label: "Nova Comanda",
    description: "Iniciar venda",
    variant: "outline" as const,
  },
  {
    icon: Package,
    label: "Entrada Estoque",
    description: "Registrar entrada",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  return (
    <div className="flex flex-wrap gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          className="h-auto gap-3 px-4 py-3"
        >
          <action.icon className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">{action.label}</div>
            <div className="text-xs opacity-80">{action.description}</div>
          </div>
        </Button>
      ))}
    </div>
  );
}
