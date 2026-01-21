import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock } from "lucide-react";
import {
  AccessLevelWithPermissions,
  PERMISSION_CATEGORIES,
  PERMISSION_LABELS,
} from "@/hooks/useAccessLevels";

interface AccessLevelConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  accessLevel: AccessLevelWithPermissions | null;
  onUpdatePermission: (data: { accessLevelId: string; permissionKey: string; enabled: boolean }) => void;
  onUpdateAccessLevel: (data: { id: string; name?: string; description?: string; color?: string }) => void;
  isUpdating: boolean;
}

const COLOR_OPTIONS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#a855f7", // purple
  "#ec4899", // pink
];

export function AccessLevelConfigModal({
  open,
  onOpenChange,
  accessLevel,
  onUpdatePermission,
  onUpdateAccessLevel,
  isUpdating,
}: AccessLevelConfigModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#6366f1");

  useEffect(() => {
    if (accessLevel) {
      setName(accessLevel.name);
      setDescription(accessLevel.description || "");
      setColor(accessLevel.color);
    }
  }, [accessLevel]);

  if (!accessLevel) return null;

  const handleNameBlur = () => {
    if (name !== accessLevel.name && name.trim()) {
      onUpdateAccessLevel({ id: accessLevel.id, name: name.trim() });
    }
  };

  const handleDescriptionBlur = () => {
    if (description !== (accessLevel.description || "")) {
      onUpdateAccessLevel({ id: accessLevel.id, description: description.trim() || undefined });
    }
  };

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onUpdateAccessLevel({ id: accessLevel.id, color: newColor });
  };

  const handlePermissionToggle = (permissionKey: string, currentValue: boolean) => {
    onUpdatePermission({
      accessLevelId: accessLevel.id,
      permissionKey,
      enabled: !currentValue,
    });
  };

  const isSystem = accessLevel.is_system;
  const isAdmin = accessLevel.system_key === "admin";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Configurar Nível de Acesso
            {isSystem && (
              <Badge variant="secondary" className="text-xs">
                <Lock className="h-3 w-3 mr-1" />
                Sistema
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleNameBlur}
                disabled={isSystem}
              />
            </div>
            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex gap-2">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => !isSystem && handleColorChange(c)}
                    disabled={isSystem}
                    className={`h-8 w-8 rounded-full border-2 transition-all ${
                      color === c ? "border-foreground scale-110" : "border-transparent"
                    } ${isSystem ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionBlur}
              disabled={isSystem}
              placeholder="Descrição do nível de acesso"
            />
          </div>

          <Separator />

          {/* Permissions */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Permissões</Label>
            {isAdmin && (
              <p className="text-sm text-muted-foreground">
                O nível Administrador tem todas as permissões habilitadas e não pode ser modificado.
              </p>
            )}
          </div>

          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-6">
              {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                <div key={categoryKey} className="space-y-3">
                  <h4 className="font-medium text-sm flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: color }}
                    />
                    {category.label}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 pl-5">
                    {category.permissions.map((permKey) => {
                      const isEnabled = accessLevel.permissions[permKey] ?? false;
                      const label = PERMISSION_LABELS[permKey] || permKey.split(".")[1];

                      return (
                        <div
                          key={permKey}
                          className="flex items-center justify-between py-1.5 px-3 rounded-md bg-muted/50"
                        >
                          <span className="text-sm">{label}</span>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handlePermissionToggle(permKey, isEnabled)}
                            disabled={isAdmin || isUpdating}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              "Fechar"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
