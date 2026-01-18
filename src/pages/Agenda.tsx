import { useState } from "react";
import { AppLayoutNew } from "@/components/layout/AppLayoutNew";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronLeft, ChevronRight, Plus, Clock, Filter, Search, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { ptBR } from "date-fns/locale";

const professionals = [
  { id: "1", name: "Ana Paula", initials: "AP", color: "bg-red-500" },
  { id: "2", name: "Carla Mendes", initials: "CM", color: "bg-blue-500" },
  { id: "3", name: "Beatriz Rocha", initials: "BR", color: "bg-purple-500" },
  { id: "4", name: "Juliana Lima", initials: "JL", color: "bg-emerald-500" },
  { id: "5", name: "Maria Santos", initials: "MS", color: "bg-pink-500" },
  { id: "6", name: "Fernanda Costa", initials: "FC", color: "bg-amber-500" },
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
  duration: number;
  status: "scheduled" | "confirmed" | "in-progress" | "completed" | "cancelled" | "blocked";
}

const mockAppointments: Appointment[] = [
  { id: "1", professionalId: "1", clientName: "Maria Silva", service: "Corte + Escova", startTime: "09:00", duration: 3, status: "confirmed" },
  { id: "2", professionalId: "1", clientName: "Fernanda Costa", service: "Coloração", startTime: "11:00", duration: 4, status: "scheduled" },
  { id: "3", professionalId: "2", clientName: "Juliana Santos", service: "Manicure + Pedicure", startTime: "10:00", duration: 2, status: "in-progress" },
  { id: "4", professionalId: "2", clientName: "Patricia Lima", service: "Design Sobrancelhas", startTime: "14:00", duration: 1, status: "scheduled" },
  { id: "5", professionalId: "3", clientName: "Camila Alves", service: "Hidratação", startTime: "09:30", duration: 2, status: "confirmed" },
  { id: "6", professionalId: "3", clientName: "Amanda Souza", service: "Escova Progressiva", startTime: "15:00", duration: 4, status: "scheduled" },
  { id: "7", professionalId: "4", clientName: "Renata Oliveira", service: "Corte Feminino", startTime: "10:00", duration: 2, status: "confirmed" },
  { id: "8", professionalId: "5", clientName: "Bloqueio", service: "", startTime: "08:00", duration: 2, status: "blocked" },
];

const statusColors: Record<string, string> = {
  scheduled: "bg-red-500 text-white",
  confirmed: "bg-green-500 text-white",
  "in-progress": "bg-amber-500 text-white",
  completed: "bg-emerald-500 text-white",
  cancelled: "bg-gray-400 text-white",
  blocked: "bg-gray-500 text-white",
};

export default function Agenda() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProfessionals, setSelectedProfessionals] = useState<string[]>(professionals.map(p => p.id));
  const [searchProfessional, setSearchProfessional] = useState("");

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
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

  const toggleProfessional = (id: string) => {
    setSelectedProfessionals(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedProfessionals.length === professionals.length) {
      setSelectedProfessionals([]);
    } else {
      setSelectedProfessionals(professionals.map(p => p.id));
    }
  };

  const filteredProfessionals = professionals.filter(p => 
    selectedProfessionals.includes(p.id) &&
    p.name.toLowerCase().includes(searchProfessional.toLowerCase())
  );

  return (
    <AppLayoutNew>
      <div className="flex gap-4">
        {/* Left Sidebar - Calendar & Filters */}
        <div className="w-64 shrink-0 space-y-4">
          {/* Mini Calendar */}
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium capitalize">{formatMonthYear(currentDate)}</span>
                <Button variant="ghost" size="icon" onClick={goToNextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={(date) => date && setCurrentDate(date)}
                locale={ptBR}
                className="w-full"
              />
            </CardContent>
          </Card>

          {/* Professionals Filter */}
          <Card>
            <CardContent className="p-3 space-y-3">
              <div className="font-medium text-sm">Profissionais</div>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Pesquisar profissional" 
                  className="pl-8 h-8 text-sm"
                  value={searchProfessional}
                  onChange={(e) => setSearchProfessional(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedProfessionals.length === professionals.length}
                      onCheckedChange={toggleAll}
                    />
                    <span className="text-sm">Todos</span>
                  </div>
                  <button className="text-xs text-primary hover:underline">
                    Expandir Tudo
                  </button>
                </div>
                {professionals.filter(p => p.name.toLowerCase().includes(searchProfessional.toLowerCase())).map(prof => (
                  <div key={prof.id} className="flex items-center gap-2">
                    <Checkbox 
                      checked={selectedProfessionals.includes(prof.id)}
                      onCheckedChange={() => toggleProfessional(prof.id)}
                    />
                    <span className="text-sm">{prof.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Calendar Grid */}
        <div className="flex-1 space-y-4">
          {/* Header Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Hoje
              </Button>
              <Button variant="outline" size="sm">
                Bloquear Horário
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Ajustar colunas:</span>
              <div className="flex gap-1">
                {[3, 5, 8, 10, 12].map(num => (
                  <Button 
                    key={num} 
                    variant={filteredProfessionals.length === num ? "default" : "outline"} 
                    size="sm"
                    className="w-8 h-8 p-0"
                  >
                    {num}
                  </Button>
                ))}
              </div>
              <Input placeholder="Pesquisar agendamento" className="w-48 h-8" />
            </div>
          </div>

          {/* Calendar Grid */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Professionals Header */}
                  <div 
                    className="grid border-b" 
                    style={{ gridTemplateColumns: `60px repeat(${filteredProfessionals.length}, 1fr)` }}
                  >
                    <div className="p-2 border-r bg-muted/30">
                      <Clock className="h-4 w-4 text-muted-foreground mx-auto" />
                    </div>
                    {filteredProfessionals.map((professional) => (
                      <div key={professional.id} className="p-2 border-r last:border-r-0 bg-muted/30 text-center">
                        <Avatar className="h-10 w-10 mx-auto mb-1">
                          <AvatarFallback className={`${professional.color} text-white text-xs`}>
                            {professional.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-xs block uppercase">{professional.name}</span>
                      </div>
                    ))}
                  </div>

                  {/* Time Slots */}
                  <div className="relative max-h-[600px] overflow-y-auto">
                    {timeSlots.map((time, index) => (
                      <div
                        key={time}
                        className="grid border-b last:border-b-0"
                        style={{ gridTemplateColumns: `60px repeat(${filteredProfessionals.length}, 1fr)` }}
                      >
                        <div className="p-1 border-r text-xs text-muted-foreground text-center bg-muted/10 flex items-center justify-center">
                          {time}
                        </div>
                        {filteredProfessionals.map((professional) => {
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
                                  className={`absolute left-0.5 right-0.5 top-0 rounded-sm p-1 z-10 cursor-pointer transition-shadow hover:shadow-md ${statusColors[appointmentAtSlot.status]}`}
                                  style={{
                                    height: `${appointmentAtSlot.duration * 40 - 2}px`,
                                  }}
                                >
                                  <div className="text-[10px] font-medium truncate">
                                    {time} {appointmentAtSlot.clientName}
                                  </div>
                                  {appointmentAtSlot.service && (
                                    <div className="text-[10px] opacity-90 truncate uppercase">
                                      {appointmentAtSlot.service}
                                    </div>
                                  )}
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
        </div>
      </div>
    </AppLayoutNew>
  );
}