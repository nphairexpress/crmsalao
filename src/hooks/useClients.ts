import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Client {
  id: string;
  salon_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  birth_date: string | null;
  notes: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface ClientInput {
  name: string;
  email?: string;
  phone?: string;
  birth_date?: string;
  notes?: string;
  tags?: string[];
}

export function useClients() {
  const { salonId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["clients", salonId],
    queryFn: async () => {
      if (!salonId) return [];
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .eq("salon_id", salonId)
        .order("name");
      if (error) throw error;
      return data as Client[];
    },
    enabled: !!salonId,
  });

  const createMutation = useMutation({
    mutationFn: async (input: ClientInput) => {
      if (!salonId) throw new Error("Salão não encontrado");
      const { data, error } = await supabase
        .from("clients")
        .insert({ ...input, salon_id: salonId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", salonId] });
      toast({ title: "Cliente criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao criar cliente", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...input }: ClientInput & { id: string }) => {
      const { data, error } = await supabase
        .from("clients")
        .update(input)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", salonId] });
      toast({ title: "Cliente atualizado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao atualizar cliente", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients", salonId] });
      toast({ title: "Cliente removido com sucesso!" });
    },
    onError: (error: Error) => {
      toast({ title: "Erro ao remover cliente", description: error.message, variant: "destructive" });
    },
  });

  return {
    clients: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    createClient: createMutation.mutate,
    updateClient: updateMutation.mutate,
    deleteClient: deleteMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
