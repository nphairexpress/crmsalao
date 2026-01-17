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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Service, ServiceInput } from "@/hooks/useServices";

interface ServiceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service | null;
  onSubmit: (data: ServiceInput & { id?: string }) => void;
  isLoading?: boolean;
}

export function ServiceModal({ open, onOpenChange, service, onSubmit, isLoading }: ServiceModalProps) {
  const [formData, setFormData] = useState<ServiceInput>({
    name: "",
    description: "",
    duration_minutes: 30,
    price: 0,
    commission_percent: 0,
    category: "",
    is_active: true,
  });

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name,
        description: service.description || "",
        duration_minutes: service.duration_minutes,
        price: Number(service.price),
        commission_percent: Number(service.commission_percent) || 0,
        category: service.category || "",
        is_active: service.is_active,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        duration_minutes: 30,
        price: 0,
        commission_percent: 0,
        category: "",
        is_active: true,
      });
    }
  }, [service, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (service) {
      onSubmit({ ...formData, id: service.id });
    } else {
      onSubmit(formData);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{service ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
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
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min) *</Label>
              <Input
                id="duration"
                type="number"
                min={5}
                step={5}
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) || 30 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$) *</Label>
              <Input
                id="price"
                type="number"
                min={0}
                step={0.01}
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Serviço Ativo</Label>
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
