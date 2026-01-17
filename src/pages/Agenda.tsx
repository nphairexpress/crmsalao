import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Plus, Clock } from "lucide-react";

const professionals = [
  { id: "1", name: "Ana Paula", initials: "AP", color: "bg-blue-500" },
  { id: "2", name: "Carla Mendes", initials: "CM", color: "bg-pink-500" },
  { id: "3", name: "Beatriz Rocha", initials: "BR", color: "bg-purple-500" },
  { id: "4", name: "Juliana Lima", initials: "JL", color: "bg-emerald-500" },
];

const timeSlots = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

interface Appointment {
  id: string;
  professionalId: string;
  clientName: string;
  service: string;
  startTime: string;
  duration: number; // in slots (30min each)
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled";
}

const mockAppointments: Appointment[] = [
  { id: "1", professionalId: "1", clientName: "Maria Silva", service: "Corte + Escova", startTime: "09:00", duration: 3, status: "confirmed" },
  { id: "2", professionalId: "1", clientName: "Fernanda Costa", service: "Coloração", startTime: "11:00", duration: 4, status: "scheduled" },
  { id: "3", professionalId: "2", clientName: "Juliana Santos", service: "Manicure + Pedicure", startTime: "10:00", duration: 2, status: "in-progress" },
  { id: "4", professionalId: "2", clientName: "Patricia Lima", service: "Design Sobrancelhas", startTime: "14:00", duration: 1, status: "scheduled" },
  { id: "5", professionalId: "3", clientName: "Camila Alves", service: "Hidratação", startTime: "09:30", duration: 2, status: "confirmed" },
  { id: "6", professionalId: "3", clientName: "Amanda Souza", service: "Escova Progressiva", startTime: "15:00", duration: 4, status: "scheduled" },
  { id: "7", professionalId: "4", clientName: "Renata Oliveira", service: "Corte Feminino", startTime: "10:00", duration: 2, status: "confirmed" },
];

const statusColors = {
  scheduled: "bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/40 dark:border-blue-700 dark:text-blue-200",
  confirmed: "bg-green-100 border-green-300 text-green-800 dark:bg-green-900/40 dark:border-green-700 dark:text-green-200",
  "in-progress": "bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-900/40 dark:border-amber-700 dark:text-amber-200",
  completed: "bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-900/40 dark:border-emerald-700 dark:text-emerald-200",
  cancelled: "bg-red-100 border-red-300 text-red-800 dark:bg-red-900/40 dark:border-red-700 dark:text-red-200",
};

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const goToPreviousDay = () => {
    setCurrentDate((prev) => new Date(prev.getTime() - 86400000));
  };

  const goToNextDay = () => {
    setCurrentDate((prev) => new Date(prev.getTime() + 86400000));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getAppointmentsForProfessional = (professionalId: string) => {
    return mockAppointments.filter((a) => a.professionalId === professionalId);
  };

  const getSlotIndex = (time: string) => {
    return timeSlots.indexOf(time);
  };

  return (
    <AppLayout title="Agenda">
      <div className="space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={goToPreviousDay}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Hoje
            </Button>
            <Button variant="outline" size="icon" onClick={goToNextDay}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <span className="ml-2 text-lg font-medium capitalize">{formatDate(currentDate)}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Dia</Button>
            <Button variant="ghost" size="sm">Semana</Button>
            <Button variant="ghost" size="sm">Mês</Button>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Agendamento
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Professionals Header */}
                <div className="grid border-b" style={{ gridTemplateColumns: "80px repeat(4, 1fr)" }}>
                  <div className="p-3 border-r bg-muted/30">
                    <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                  </div>
                  {professionals.map((professional) => (
                    <div key={professional.id} className="p-3 border-r last:border-r-0 bg-muted/30">
                      <div className="flex items-center justify-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className={`${professional.color} text-white text-xs`}>
                            {professional.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-sm">{professional.name}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <div className="relative">
                  {timeSlots.map((time, index) => (
                    <div
                      key={time}
                      className="grid border-b last:border-b-0"
                      style={{ gridTemplateColumns: "80px repeat(4, 1fr)" }}
                    >
                      <div className="p-2 border-r text-xs text-muted-foreground text-center bg-muted/10">
                        {time}
                      </div>
                      {professionals.map((professional) => {
                        const appointments = getAppointmentsForProfessional(professional.id);
                        const appointmentAtSlot = appointments.find(
                          (a) => getSlotIndex(a.startTime) === index
                        );

                        return (
                          <div
                            key={`${professional.id}-${time}`}
                            className="relative border-r last:border-r-0 h-10 hover:bg-muted/30 transition-colors cursor-pointer"
                          >
                            {appointmentAtSlot && (
                              <div
                                className={`absolute left-1 right-1 top-0 rounded-md border p-2 z-10 cursor-pointer transition-shadow hover:shadow-md ${statusColors[appointmentAtSlot.status]}`}
                                style={{
                                  height: `${appointmentAtSlot.duration * 40 - 4}px`,
                                }}
                              >
                                <div className="text-xs font-medium truncate">
                                  {appointmentAtSlot.clientName}
                                </div>
                                <div className="text-xs opacity-75 truncate">
                                  {appointmentAtSlot.service}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">Status:</span>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-blue-400" />
            <span>Agendado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-green-400" />
            <span>Confirmado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-amber-400" />
            <span>Em Atendimento</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-emerald-400" />
            <span>Finalizado</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
