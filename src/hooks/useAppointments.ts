import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/dynamicSupabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";
import { sendEmail } from "@/lib/sendEmail";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type AppointmentStatus = Database["public"]["Enums"]["appointment_status"];

export interface Appointment {
  id: string;
  salon_id: string;
  client_id: string | null;
  professional_id: string;
  service_id: string | null;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  notes: string | null;
  price: number | null;
  group_id: string | null;
  created_at: string;
  updated_at: string;
  clients?: { name: string; phone: string | null } | null;
  professionals?: { name: string } | null;
  services?: { name: string } | null;
}

export interface AppointmentInput {
  client_id?: string;
  professional_id: string;
  service_id?: string;
  scheduled_at: string;
  duration_minutes: number;
  status?: AppointmentStatus;
  notes?: string;
  price?: number;
  group_id?: string;
}

export interface MultiAppointmentInput {
  services: AppointmentInput[];
}

export function useAppointments(date?: Date) {
  const { salonId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["appointments", salonId, date?.toISOString().split("T")[0]],
    queryFn: async () => {
      if (!salonId) return [];
      
      let query = supabase
        .from("appointments")
        .select(`
          *,
          clients(name, phone),
          professionals(name),
          services(name)
        `)
        .eq("salon_id", salonId)
        .order("scheduled_at");
      
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);
        
        query = query
          .gte("scheduled_at", startOfDay.toISOString())
          .lte("scheduled_at", endOfDay.toISOString());
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Appointment[];
    },
    enabled: !!salonId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: AppointmentInput) => {
      if (!salonId) throw new Error("Salão não encontrado");
      const { data, error } = await supabase
        .from("appointments")
        .insert({ ...input, salon_id: salonId })
        .select(`
          *,
          clients(name, phone, email),
          professionals(name),
          services(name)
        `)
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Agendamento criado com sucesso!" });

      // Send confirmation email
      try {
        const client = (data as any)?.clients;
        const professional = (data as any)?.professionals;
        const service = (data as any)?.services;
        if (client?.email && salonId) {
          const scheduledDate = new Date(data.scheduled_at);
          sendEmail({
            type: "appointment_confirmation",
            salon_id: salonId,
            to_email: client.email,
            to_name: client.name || "Cliente",
            client_id: data.client_id || undefined,
            variables: {
              service_name: service?.name || "Não informado",
              professional_name: professional?.name || "Não informado",
              date: format(scheduledDate, "dd/MM/yyyy", { locale: ptBR }),
              time: format(scheduledDate, "HH:mm"),
            },
          }).catch(console.error);
        }
      } catch (e) { console.error("Email error:", e); }
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar agendamento", description: error.message, variant: "destructive" });
    },
  });

  const createMultipleMutation = useMutation({
    mutationFn: async (input: MultiAppointmentInput) => {
      if (!salonId) throw new Error("Salão não encontrado");
      const rows = input.services.map((s) => ({ ...s, salon_id: salonId }));
      const { data, error } = await supabase
        .from("appointments")
        .insert(rows)
        .select(`
          *,
          clients(name, phone, email),
          professionals(name),
          services(name)
        `);
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: `${data.length} agendamento(s) criado(s) com sucesso!` });

      // Send confirmation email with ALL services listed
      try {
        if (data.length > 0) {
          const first = data[0] as any;
          const client = first.clients;
          if (client?.email && salonId) {
            const scheduledDate = new Date(first.scheduled_at);
            const servicesList = data.map((a: any) => {
              const t = format(new Date(a.scheduled_at), "HH:mm");
              return `${a.services?.name || "Serviço"} às ${t}`;
            }).join("\n");

            sendEmail({
              type: "appointment_confirmation",
              salon_id: salonId,
              to_email: client.email,
              to_name: client.name || "Cliente",
              client_id: first.client_id || undefined,
              variables: {
                service_name: servicesList,
                professional_name: data.length > 1 ? "Equipe do salão" : (first.professionals?.name || "Não informado"),
                date: format(scheduledDate, "dd/MM/yyyy", { locale: ptBR }),
                time: data.length > 1 ? data.map((a: any) => format(new Date(a.scheduled_at), "HH:mm")).join(", ") : format(scheduledDate, "HH:mm"),
              },
            }).catch(console.error);
          }
        }
      } catch (e) { console.error("Email error:", e); }
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar agendamentos", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...input }: Partial<AppointmentInput> & { id: string }) => {
      const { data, error } = await supabase
        .from("appointments")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Agendamento atualizado com sucesso!" });

      // Send update notification email
      try {
        if (data?.client_id && salonId) {
          supabase.from("clients").select("name, email").eq("id", data.client_id).single().then(({ data: client }) => {
            if (client?.email) {
              supabase.from("services").select("name").eq("id", data.service_id).single().then(({ data: service }) => {
                supabase.from("professionals").select("name").eq("id", data.professional_id).single().then(({ data: prof }) => {
                  const scheduledDate = new Date(data.scheduled_at);
                  sendEmail({
                    type: "appointment_update" as any,
                    salon_id: salonId,
                    to_email: client.email,
                    to_name: client.name || "Cliente",
                    client_id: data.client_id || undefined,
                    variables: {
                      service_name: service?.name || "Não informado",
                      professional_name: prof?.name || "Não informado",
                      date: format(scheduledDate, "dd/MM/yyyy", { locale: ptBR }),
                      time: format(scheduledDate, "HH:mm"),
                    },
                  }).catch(console.error);
                });
              });
            }
          });
        }
      } catch (e) { console.error("Email error:", e); }
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar agendamento", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Agendamento removido com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover agendamento", description: error.message, variant: "destructive" });
    },
  });

  return {
    appointments: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createAppointment: createMutation.mutate,
    createMultipleAppointments: createMultipleMutation.mutate,
    updateAppointment: updateMutation.mutate,
    deleteAppointment: deleteMutation.mutate,
    isCreating: createMutation.isPending || createMultipleMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
