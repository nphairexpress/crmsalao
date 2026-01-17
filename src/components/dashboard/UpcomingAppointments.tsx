import { Calendar, Clock, User, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Appointment {
  id: string;
  clientName: string;
  clientInitials: string;
  service: string;
  professional: string;
  time: string;
  duration: string;
  status: "scheduled" | "confirmed" | "in-progress" | "completed";
}

const statusConfig = {
  scheduled: { label: "Agendado", className: "status-scheduled" },
  confirmed: { label: "Confirmado", className: "status-confirmed" },
  "in-progress": { label: "Em atendimento", className: "status-in-progress" },
  completed: { label: "Finalizado", className: "status-completed" },
};

const mockAppointments: Appointment[] = [
  {
    id: "1",
    clientName: "Maria Silva",
    clientInitials: "MS",
    service: "Corte + Escova",
    professional: "Ana Paula",
    time: "10:00",
    duration: "1h30",
    status: "in-progress",
  },
  {
    id: "2",
    clientName: "Juliana Santos",
    clientInitials: "JS",
    service: "Manicure + Pedicure",
    professional: "Carla Mendes",
    time: "10:30",
    duration: "1h",
    status: "confirmed",
  },
  {
    id: "3",
    clientName: "Fernanda Costa",
    clientInitials: "FC",
    service: "Coloração",
    professional: "Ana Paula",
    time: "11:30",
    duration: "2h",
    status: "scheduled",
  },
  {
    id: "4",
    clientName: "Patricia Lima",
    clientInitials: "PL",
    service: "Hidratação",
    professional: "Beatriz Rocha",
    time: "12:00",
    duration: "45min",
    status: "scheduled",
  },
  {
    id: "5",
    clientName: "Camila Alves",
    clientInitials: "CA",
    service: "Design de Sobrancelhas",
    professional: "Carla Mendes",
    time: "13:00",
    duration: "30min",
    status: "scheduled",
  },
];

export function UpcomingAppointments() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold">Próximos Atendimentos</CardTitle>
        <Button variant="outline" size="sm">
          Ver Agenda Completa
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {mockAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="flex items-center gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
            >
              {/* Client Avatar */}
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {appointment.clientInitials}
                </AvatarFallback>
              </Avatar>

              {/* Main Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium truncate">{appointment.clientName}</p>
                  <Badge variant="secondary" className={statusConfig[appointment.status].className}>
                    {statusConfig[appointment.status].label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{appointment.service}</p>
              </div>

              {/* Professional */}
              <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{appointment.professional}</span>
              </div>

              {/* Time */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{appointment.time}</span>
                </div>
                <span className="text-muted-foreground hidden sm:inline">
                  {appointment.duration}
                </span>
              </div>

              {/* Actions */}
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
