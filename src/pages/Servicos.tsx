import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Clock, DollarSign, MoreHorizontal } from "lucide-react";

const services = [
  { id: "1", name: "Corte Feminino", duration: "45min", price: 80, commission: 40, category: "Cabelo", active: true },
  { id: "2", name: "Corte Masculino", duration: "30min", price: 50, commission: 40, category: "Cabelo", active: true },
  { id: "3", name: "Coloração", duration: "2h", price: 180, commission: 35, category: "Cabelo", active: true },
  { id: "4", name: "Escova", duration: "45min", price: 60, commission: 40, category: "Cabelo", active: true },
  { id: "5", name: "Manicure", duration: "45min", price: 35, commission: 50, category: "Unhas", active: true },
  { id: "6", name: "Pedicure", duration: "45min", price: 45, commission: 50, category: "Unhas", active: true },
  { id: "7", name: "Design Sobrancelhas", duration: "30min", price: 40, commission: 45, category: "Estética", active: true },
  { id: "8", name: "Hidratação", duration: "1h", price: 90, commission: 35, category: "Cabelo", active: true },
];

export default function Servicos() {
  return (
    <AppLayout title="Serviços">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-muted-foreground">Gerencie os serviços oferecidos pelo salão</p>
          <Button className="gap-2"><Plus className="h-4 w-4" />Novo Serviço</Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{service.name}</CardTitle>
                    <Badge variant="outline" className="mt-1">{service.category}</Badge>
                  </div>
                  <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />{service.duration}
                  </div>
                  <div className="flex items-center gap-1 font-medium">
                    <DollarSign className="h-4 w-4" />R$ {service.price}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Comissão: {service.commission}%</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
