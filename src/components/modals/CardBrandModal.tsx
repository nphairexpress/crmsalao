import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { CardBrand, CardBrandInput } from "@/hooks/useCardBrands";

interface CardBrandModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: CardBrandInput) => void;
  cardBrand?: CardBrand | null;
  isLoading?: boolean;
}

export function CardBrandModal({ open, onClose, onSave, cardBrand, isLoading }: CardBrandModalProps) {
  const [name, setName] = useState("");
  const [debitFeePercent, setDebitFeePercent] = useState("");
  const [creditFeePercent, setCreditFeePercent] = useState("");
  const [credit26FeePercent, setCredit26FeePercent] = useState("");
  const [credit712FeePercent, setCredit712FeePercent] = useState("");
  const [credit1318FeePercent, setCredit1318FeePercent] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (cardBrand) {
      setName(cardBrand.name);
      setDebitFeePercent(String(cardBrand.debit_fee_percent));
      setCreditFeePercent(String(cardBrand.credit_fee_percent));
      setCredit26FeePercent(String(cardBrand.credit_2_6_fee_percent || 0));
      setCredit712FeePercent(String(cardBrand.credit_7_12_fee_percent || 0));
      setCredit1318FeePercent(String(cardBrand.credit_13_18_fee_percent || 0));
      setIsActive(cardBrand.is_active);
    } else {
      setName("");
      setDebitFeePercent("");
      setCreditFeePercent("");
      setCredit26FeePercent("");
      setCredit712FeePercent("");
      setCredit1318FeePercent("");
      setIsActive(true);
    }
  }, [cardBrand, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      debit_fee_percent: parseFloat(debitFeePercent) || 0,
      credit_fee_percent: parseFloat(creditFeePercent) || 0,
      credit_2_6_fee_percent: parseFloat(credit26FeePercent) || 0,
      credit_7_12_fee_percent: parseFloat(credit712FeePercent) || 0,
      credit_13_18_fee_percent: parseFloat(credit1318FeePercent) || 0,
      is_active: isActive,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {cardBrand ? "Editar Bandeira" : "Nova Bandeira de Cartão"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Bandeira</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Visa, Mastercard, Elo..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="debitFee">Débito (%)</Label>
              <Input
                id="debitFee"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={debitFeePercent}
                onChange={(e) => setDebitFeePercent(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creditFee">Crédito à vista (%)</Label>
              <Input
                id="creditFee"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={creditFeePercent}
                onChange={(e) => setCreditFeePercent(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <Separator />
          <Label className="text-sm font-semibold text-muted-foreground">Crédito Parcelado</Label>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="credit26Fee" className="text-xs">2x a 6x (%)</Label>
              <Input
                id="credit26Fee"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={credit26FeePercent}
                onChange={(e) => setCredit26FeePercent(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit712Fee" className="text-xs">7x a 12x (%)</Label>
              <Input
                id="credit712Fee"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={credit712FeePercent}
                onChange={(e) => setCredit712FeePercent(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="credit1318Fee" className="text-xs">13x a 18x (%)</Label>
              <Input
                id="credit1318Fee"
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={credit1318FeePercent}
                onChange={(e) => setCredit1318FeePercent(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive">Bandeira Ativa</Label>
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
