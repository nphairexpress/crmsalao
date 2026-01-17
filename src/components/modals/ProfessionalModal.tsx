import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Professional, ProfessionalInput } from "@/hooks/useProfessionals";

interface ProfessionalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  professional?: Professional | null;
  onSubmit: (data: ProfessionalInput & { id?: string }) => void;
  isLoading?: boolean;
}

export function ProfessionalModal({ open, onOpenChange, professional, onSubmit, isLoading }: ProfessionalModalProps) {
  const [formData, setFormData] = useState<ProfessionalInput>({
    name: "",
    email: "",
    phone: "",
    specialty: "",
    commission_percent: 0,
    is_active: true,
  });

  useEffect(() => {
    if (professional) {
      setFormData({
        name: professional.name,
        email: professional.email || "",
        phone: professional.phone || "",
        specialty: professional.specialty || "",
        commission_percent: Number(professional.commission_percent) || 0,
        is_active: professional.is_active,
      });
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        specialty: "",
        commission_percent: 0,
        is_active: true,
      });
    }
  }, [professional, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (professional) {
      onSubmit({ ...formData, id: professional.id });
    } else {
      onSubmit(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{professional ? "Editar Profissional" : "Novo Profissional"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="specialty">Especialidade</Label>
              <Input
                id="specialty"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commission">Comissão (%)</Label>
              <Input
                id="commission"
                type="number"
                min={0}
                max={100}
                value={formData.commission_percent}
                onChange={(e) => setFormData({ ...formData, commission_percent: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Profissional Ativo</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
