import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { Appointment } from "@/hooks/useAppointments";

interface AppointmentHoverCardProps {
  appointment: Appointment;
  children: React.ReactNode;
}

const statusLabels: Record<string, string> = {
  scheduled: "Agendado",
  confirmed: "Confirmado",
  in_progress: "Em Atendimento",
  completed: "Finalizado",
  no_show: "Não Compareceu",
  cancelled: "Cancelado",
};

const statusBadgeColors: Record<string, string> = {
  scheduled: "bg-[#4a7c59] hover:bg-[#4a7c59]",
  confirmed: "bg-[#3b82c4] hover:bg-[#3b82c4]",
  in_progress: "bg-[#16a34a] hover:bg-[#16a34a]",
  completed: "bg-[#3b5998] hover:bg-[#3b5998]",
  paid: "bg-[#dc2626] hover:bg-[#dc2626]",
  awaiting: "bg-[#d4a127] hover:bg-[#d4a127]",
  no_show: "bg-[#9ca3af] hover:bg-[#9ca3af]",
  cancelled: "bg-[#6b7280] hover:bg-[#6b7280]",
};

function buildWhatsAppUrl(appointment: Appointment): string | null {
  const phone = appointment.clients?.phone;
  if (!phone) return null;
  const cleanPhone = phone.replace(/\D/g, "");
  const phoneWithCountry = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const scheduledDate = new Date(appointment.scheduled_at);
  const dateStr = format(scheduledDate, "dd/MM/yyyy", { locale: ptBR });
  const timeStr = format(scheduledDate, "HH:mm", { locale: ptBR });
  const clientName = appointment.clients?.name || "Cliente";
  const serviceName = appointment.services?.name || "seu horário";
  const professionalName = appointment.professionals?.name || "nossa equipe";
  const message = `Olá ${clientName}! 😊 Confirmando seu horário no NP Hair Studio: ${serviceName} dia ${dateStr} às ${timeStr} com ${professionalName}. Te esperamos! 💇‍♀️`;
  return `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(message)}`;
}

export function AppointmentHoverCard({ appointment, children }: AppointmentHoverCardProps) {
  const scheduledDate = new Date(appointment.scheduled_at);
  const whatsappUrl = buildWhatsAppUrl(appointment);
  
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-72 p-4 z-[9999]" side="right" align="start" sideOffset={8}>
        <div className="space-y-3">
          {/* Date and Client Name */}
          <div>
            <p className="font-semibold text-sm text-foreground">
              {format(scheduledDate, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            </p>
            <p className="text-base font-bold text-foreground">
              {appointment.clients?.name || "Cliente não informado"}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-1.5 text-sm">
            {appointment.clients?.phone && (
              <p>
                <span className="font-semibold">Telefone:</span>{" "}
                {appointment.clients.phone}
              </p>
            )}
            
            <p>
              <span className="font-semibold">Profissional:</span>{" "}
              {appointment.professionals?.name || "Não informado"}
            </p>
            
            <p>
              <span className="font-semibold">Serviço:</span>{" "}
              {appointment.services?.name || "Não informado"}
            </p>

            <div className="flex items-center gap-2">
              <span className="font-semibold">Status:</span>
              <Badge className={`${statusBadgeColors[appointment.status]} text-white text-xs`}>
                {statusLabels[appointment.status]}
              </Badge>
            </div>

            {appointment.notes && (
              <p>
                <span className="font-semibold">Obs:</span>{" "}
                <span className="text-muted-foreground">{appointment.notes}</span>
              </p>
            )}
          </div>

          {/* WhatsApp Button */}
          {whatsappUrl && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2 text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700"
              asChild
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                Enviar WhatsApp
              </a>
            </Button>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
