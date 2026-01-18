import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Caixa } from "@/hooks/useCaixas";

interface CloseCaixaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (closingBalance: number, notes?: string) => void;
  caixa: Caixa | null;
  isLoading?: boolean;
}

export function CloseCaixaModal({ open, onClose, onConfirm, caixa, isLoading }: CloseCaixaModalProps) {
  const [closingBalance, setClosingBalance] = useState("");
  const [notes, setNotes] = useState("");

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const handleConfirm = () => {
    const balance = parseFloat(closingBalance.replace(",", ".")) || 0;
    onConfirm(balance, notes || undefined);
    setClosingBalance("");
    setNotes("");
  };

  if (!caixa) return null;

  const totalReceived = 
    (caixa.total_cash || 0) + 
    (caixa.total_pix || 0) + 
    (caixa.total_credit_card || 0) + 
    (caixa.total_debit_card || 0) + 
    (caixa.total_other || 0);

  const expectedCash = (caixa.opening_balance || 0) + (caixa.total_cash || 0);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fechar Caixa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h4 className="font-medium text-sm">Resumo do Caixa</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-muted-foreground">Abertura:</span>
                <span className="text-right">{formatCurrency(caixa.opening_balance || 0)}</span>
                
                <span className="text-muted-foreground">Dinheiro:</span>
                <span className="text-right">{formatCurrency(caixa.total_cash || 0)}</span>
                
                <span className="text-muted-foreground">PIX:</span>
                <span className="text-right">{formatCurrency(caixa.total_pix || 0)}</span>
                
                <span className="text-muted-foreground">Cartão Crédito:</span>
                <span className="text-right">{formatCurrency(caixa.total_credit_card || 0)}</span>
                
                <span className="text-muted-foreground">Cartão Débito:</span>
                <span className="text-right">{formatCurrency(caixa.total_debit_card || 0)}</span>
                
                <span className="text-muted-foreground">Outros:</span>
                <span className="text-right">{formatCurrency(caixa.total_other || 0)}</span>
                
                <span className="font-medium border-t pt-2">Total Recebido:</span>
                <span className="text-right font-medium border-t pt-2">{formatCurrency(totalReceived)}</span>
                
                <span className="font-medium text-primary">Dinheiro Esperado:</span>
                <span className="text-right font-medium text-primary">{formatCurrency(expectedCash)}</span>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <Label htmlFor="closingBalance">Valor em Dinheiro no Caixa (R$)</Label>
            <Input
              id="closingBalance"
              type="text"
              placeholder="0,00"
              value={closingBalance}
              onChange={(e) => setClosingBalance(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Conte o dinheiro no caixa e informe o valor total
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Observações (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Observações sobre o fechamento do caixa..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? "Fechando..." : "Fechar Caixa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
