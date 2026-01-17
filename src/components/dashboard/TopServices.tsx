import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const services = [
  { name: "Corte Feminino", count: 45, revenue: 4500, percentage: 100 },
  { name: "Coloração", count: 28, revenue: 5600, percentage: 85 },
  { name: "Manicure + Pedicure", count: 52, revenue: 2600, percentage: 70 },
  { name: "Escova", count: 38, revenue: 1900, percentage: 55 },
  { name: "Hidratação", count: 22, revenue: 1760, percentage: 40 },
];

export function TopServices() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Serviços Mais Vendidos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {services.map((service, index) => (
            <div key={service.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{service.name}</span>
                </div>
                <span className="text-muted-foreground">{service.count} vendas</span>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={service.percentage} className="h-2" />
                <span className="text-sm font-medium min-w-[80px] text-right">
                  R$ {service.revenue.toLocaleString("pt-BR")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
