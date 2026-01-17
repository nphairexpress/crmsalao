import { DollarSign, Users, Calendar, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel: string;
  icon: React.ReactNode;
}

function StatCard({ title, value, change, changeLabel, icon }: StatCardProps) {
  const isPositive = change > 0;
  const isNeutral = change === 0;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold tracking-tight">{value}</p>
            <div className="flex items-center gap-1 text-sm">
              {isNeutral ? (
                <Minus className="h-4 w-4 text-muted-foreground" />
              ) : isPositive ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
              <span className={isNeutral ? "text-muted-foreground" : isPositive ? "text-success" : "text-destructive"}>
                {isPositive && "+"}{change}%
              </span>
              <span className="text-muted-foreground">{changeLabel}</span>
            </div>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  const stats = [
    {
      title: "Faturamento Hoje",
      value: "R$ 2.450,00",
      change: 12,
      changeLabel: "vs ontem",
      icon: <DollarSign className="h-6 w-6" />,
    },
    {
      title: "Atendimentos Hoje",
      value: "18",
      change: 5,
      changeLabel: "vs ontem",
      icon: <Calendar className="h-6 w-6" />,
    },
    {
      title: "Ticket Médio",
      value: "R$ 136,11",
      change: -3,
      changeLabel: "vs semana",
      icon: <TrendingUp className="h-6 w-6" />,
    },
    {
      title: "Novos Clientes",
      value: "4",
      change: 0,
      changeLabel: "vs ontem",
      icon: <Users className="h-6 w-6" />,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}
