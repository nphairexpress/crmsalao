import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface AccessLevel {
  id: string;
  salon_id: string | null;
  name: string;
  description: string | null;
  is_system: boolean;
  system_key: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface AccessLevelPermission {
  id: string;
  access_level_id: string;
  permission_key: string;
  enabled: boolean;
}

export interface AccessLevelWithPermissions extends AccessLevel {
  permissions: Record<string, boolean>;
}

export const PERMISSION_CATEGORIES = {
  dashboard: { label: "Dashboard", permissions: ["dashboard.view"] },
  agenda: { 
    label: "Agenda", 
    permissions: ["agenda.view", "agenda.create", "agenda.edit", "agenda.delete"] 
  },
  clients: { 
    label: "Clientes", 
    permissions: ["clients.view", "clients.create", "clients.edit", "clients.delete"] 
  },
  comandas: { 
    label: "Comandas", 
    permissions: ["comandas.view", "comandas.create", "comandas.edit", "comandas.delete"] 
  },
  professionals: { 
    label: "Profissionais", 
    permissions: ["professionals.view", "professionals.create", "professionals.edit", "professionals.delete"] 
  },
  services: { 
    label: "Serviços", 
    permissions: ["services.view", "services.create", "services.edit", "services.delete"] 
  },
  products: { 
    label: "Produtos/Estoque", 
    permissions: ["products.view", "products.create", "products.edit", "products.delete"] 
  },
  financial: { 
    label: "Financeiro", 
    permissions: ["financial.view", "financial.create", "financial.edit", "financial.delete"] 
  },
  caixa: { 
    label: "Caixa", 
    permissions: ["caixa.view", "caixa.open", "caixa.close", "caixa.edit"] 
  },
  commissions: { 
    label: "Comissões", 
    permissions: ["commissions.view", "commissions.edit"] 
  },
  settings: { 
    label: "Configurações", 
    permissions: ["settings.view", "settings.edit", "settings.users"] 
  },
};

export const PERMISSION_LABELS: Record<string, string> = {
  "dashboard.view": "Visualizar",
  "agenda.view": "Visualizar",
  "agenda.create": "Criar",
  "agenda.edit": "Editar",
  "agenda.delete": "Excluir",
  "clients.view": "Visualizar",
  "clients.create": "Criar",
  "clients.edit": "Editar",
  "clients.delete": "Excluir",
  "comandas.view": "Visualizar",
  "comandas.create": "Criar",
  "comandas.edit": "Editar",
  "comandas.delete": "Excluir",
  "professionals.view": "Visualizar",
  "professionals.create": "Criar",
  "professionals.edit": "Editar",
  "professionals.delete": "Excluir",
  "services.view": "Visualizar",
  "services.create": "Criar",
  "services.edit": "Editar",
  "services.delete": "Excluir",
  "products.view": "Visualizar",
  "products.create": "Criar",
  "products.edit": "Editar",
  "products.delete": "Excluir",
  "financial.view": "Visualizar",
  "financial.create": "Criar",
  "financial.edit": "Editar",
  "financial.delete": "Excluir",
  "caixa.view": "Visualizar",
  "caixa.open": "Abrir",
  "caixa.close": "Fechar",
  "caixa.edit": "Editar",
  "commissions.view": "Visualizar",
  "commissions.edit": "Editar",
  "settings.view": "Visualizar",
  "settings.edit": "Editar",
  "settings.users": "Gerenciar Usuários",
};

export function useAccessLevels() {
  const { salonId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const accessLevelsQuery = useQuery({
    queryKey: ["access-levels", salonId],
    queryFn: async () => {
      if (!salonId) return [];

      const { data: levels, error: levelsError } = await supabase
        .from("access_levels")
        .select("*")
        .eq("salon_id", salonId)
        .order("is_system", { ascending: false })
        .order("name");

      if (levelsError) throw levelsError;
      if (!levels || levels.length === 0) return [];

      // Get permissions for all levels
      const levelIds = levels.map(l => l.id);
      const { data: permissions, error: permError } = await supabase
        .from("access_level_permissions")
        .select("*")
        .in("access_level_id", levelIds);

      if (permError) throw permError;

      // Combine data
      const levelsWithPermissions: AccessLevelWithPermissions[] = levels.map(level => {
        const levelPerms = permissions?.filter(p => p.access_level_id === level.id) || [];
        const permissionsMap: Record<string, boolean> = {};
        levelPerms.forEach(p => {
          permissionsMap[p.permission_key] = p.enabled;
        });

        return {
          ...level,
          permissions: permissionsMap,
        };
      });

      return levelsWithPermissions;
    },
    enabled: !!salonId,
  });

  const createAccessLevelMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; color?: string }) => {
      if (!salonId) throw new Error("Salão não encontrado");

      const { data: newLevel, error } = await supabase
        .from("access_levels")
        .insert({
          salon_id: salonId,
          name: data.name,
          description: data.description,
          color: data.color || "#6366f1",
          is_system: false,
        })
        .select()
        .single();

      if (error) throw error;

      // Initialize all permissions as false
      const allPermissions = Object.values(PERMISSION_CATEGORIES).flatMap(cat => cat.permissions);
      const permInserts = allPermissions.map(key => ({
        access_level_id: newLevel.id,
        permission_key: key,
        enabled: false,
      }));

      const { error: permError } = await supabase
        .from("access_level_permissions")
        .insert(permInserts);

      if (permError) throw permError;

      return newLevel;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-levels", salonId] });
      toast({ title: "Nível de acesso criado com sucesso!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao criar nível de acesso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateAccessLevelMutation = useMutation({
    mutationFn: async (data: { id: string; name?: string; description?: string; color?: string }) => {
      const { id, ...updateData } = data;

      const { error } = await supabase
        .from("access_levels")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-levels", salonId] });
      toast({ title: "Nível de acesso atualizado!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar nível de acesso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updatePermissionMutation = useMutation({
    mutationFn: async (data: { accessLevelId: string; permissionKey: string; enabled: boolean }) => {
      const { error } = await supabase
        .from("access_level_permissions")
        .update({ enabled: data.enabled })
        .eq("access_level_id", data.accessLevelId)
        .eq("permission_key", data.permissionKey);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-levels", salonId] });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao atualizar permissão",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAccessLevelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("access_levels")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["access-levels", salonId] });
      toast({ title: "Nível de acesso excluído!" });
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao excluir nível de acesso",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    accessLevels: accessLevelsQuery.data ?? [],
    isLoading: accessLevelsQuery.isLoading,
    error: accessLevelsQuery.error,
    createAccessLevel: createAccessLevelMutation.mutate,
    updateAccessLevel: updateAccessLevelMutation.mutate,
    updatePermission: updatePermissionMutation.mutate,
    deleteAccessLevel: deleteAccessLevelMutation.mutate,
    isCreating: createAccessLevelMutation.isPending,
    isUpdating: updateAccessLevelMutation.isPending || updatePermissionMutation.isPending,
    isDeleting: deleteAccessLevelMutation.isPending,
  };
}
