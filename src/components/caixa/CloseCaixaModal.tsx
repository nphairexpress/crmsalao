import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2, Gift, CheckCircle, Printer, FileText } from "lucide-react";
import { Caixa } from "@/hooks/useCaixas";
import { supabase } from "@/lib/dynamicSupabaseClient";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  const [openComandasCount, setOpenComandasCount] = useState(0);
  const [checkingComandas, setCheckingComandas] = useState(false);
  const [totalCredits, setTotalCredits] = useState(0);
  const [totalDebts, setTotalDebts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [closedBalanceValue, setClosedBalanceValue] = useState(0);
  const [closedNotes, setClosedNotes] = useState<string | undefined>();
  const [closedAt, setClosedAt] = useState<Date>(new Date());
  const { salonId } = useAuth();

  useEffect(() => {
    if (open && caixa?.id && salonId) {
      checkOpenComandas();
      fetchCreditsAndDebts();
    }
  }, [open, caixa?.id, salonId]);

  const checkOpenComandas = async () => {
    if (!caixa?.id || !salonId) return;
    
    setCheckingComandas(true);
    try {
      const { data, error } = await supabase
        .from("comandas")
        .select("id", { count: "exact" })
        .eq("salon_id", salonId)
        .eq("caixa_id", caixa.id)
        .is("closed_at", null);

      if (!error) {
        setOpenComandasCount(data?.length || 0);
      }
    } catch (error) {
      console.error("Error checking open comandas:", error);
    } finally {
      setCheckingComandas(false);
    }
  };

  const fetchCreditsAndDebts = async () => {
    if (!caixa?.id) return;
    try {
      const { data: comandas } = await supabase
        .from("comandas")
        .select("id")
        .eq("caixa_id", caixa.id);

      const comandaIds = comandas?.map(c => c.id) || [];
      if (comandaIds.length === 0) {
        setTotalCredits(0);
        setTotalDebts(0);
        return;
      }

      const [creditsRes, debtsRes] = await Promise.all([
        supabase
          .from("client_credits")
          .select("credit_amount")
          .in("comanda_id", comandaIds),
        supabase
          .from("client_debts" as any)
          .select("debt_amount")
          .in("comanda_id", comandaIds),
      ]);

      setTotalCredits((creditsRes.data || []).reduce((sum: number, c: any) => sum + Number(c.credit_amount || 0), 0));
      setTotalDebts((debtsRes.data || []).reduce((sum: number, d: any) => sum + Number(d.debt_amount || 0), 0));
    } catch (error) {
      console.error("Error fetching credits/debts:", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  const handleConfirm = () => {
    if (openComandasCount > 0) return;

    const balance = parseFloat(closingBalance.replace(",", ".")) || 0;
    setClosedBalanceValue(balance);
    setClosedNotes(notes || undefined);
    setClosedAt(new Date());
    onConfirm(balance, notes || undefined);
    setShowSuccess(true);
  };

  const handleDismiss = () => {
    setClosingBalance("");
    setNotes("");
    setShowSuccess(false);
    onClose();
  };

  const handlePrintCaixaReport = () => {
    if (!caixa) return;

    const fmtCurr = (v: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

    const openedAtStr = caixa.opened_at
      ? format(new Date(caixa.opened_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
      : "-";
    const closedAtStr = format(closedAt, "dd/MM/yyyy HH:mm", { locale: ptBR });
    const operatorName = caixa.profile?.full_name || "Operador";
    const totalReceivedVal =
      (caixa.total_cash || 0) +
      (caixa.total_pix || 0) +
      (caixa.total_credit_card || 0) +
      (caixa.total_debit_card || 0) +
      (caixa.total_other || 0);
    const expectedCashVal = (caixa.opening_balance || 0) + (caixa.total_cash || 0);
    const diffVal = closedBalanceValue - expectedCashVal;

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Relatório de Fechamento de Caixa</title>
<style>
  @page { size: A4; margin: 20mm; }
  body { font-family: Arial, sans-serif; font-size: 13px; color: #222; max-width: 700px; margin: 0 auto; padding: 20px; }
  h1 { text-align: center; font-size: 18px; margin-bottom: 4px; }
  .subtitle { text-align: center; color: #666; font-size: 12px; margin-bottom: 20px; }
  .section { margin-bottom: 16px; }
  .section-title { font-weight: bold; font-size: 14px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; }
  table { width: 100%; border-collapse: collapse; }
  td { padding: 4px 0; }
  .label { color: #555; }
  .value { text-align: right; font-weight: 500; }
  .highlight { background: #f5f5f5; padding: 8px; border-radius: 4px; }
  .diff-ok { color: #16a34a; }
  .diff-bad { color: #dc2626; }
  .divider { border-top: 1px solid #ddd; margin: 12px 0; }
  .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #999; }
</style></head><body>
  <h1>Relatório de Fechamento de Caixa</h1>
  <div class="subtitle">Gerado em ${format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</div>

  <div class="section">
    <div class="section-title">Informações Gerais</div>
    <table>
      <tr><td class="label">Operador:</td><td class="value">${operatorName}</td></tr>
      <tr><td class="label">Abertura:</td><td class="value">${openedAtStr}</td></tr>
      <tr><td class="label">Fechamento:</td><td class="value">${closedAtStr}</td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Movimentação por Forma de Pagamento</div>
    <table>
      <tr><td class="label">Saldo de Abertura:</td><td class="value">${fmtCurr(caixa.opening_balance || 0)}</td></tr>
      <tr><td class="label">Dinheiro:</td><td class="value">${fmtCurr(caixa.total_cash || 0)}</td></tr>
      <tr><td class="label">PIX:</td><td class="value">${fmtCurr(caixa.total_pix || 0)}</td></tr>
      <tr><td class="label">Cartão de Crédito:</td><td class="value">${fmtCurr(caixa.total_credit_card || 0)}</td></tr>
      <tr><td class="label">Cartão de Débito:</td><td class="value">${fmtCurr(caixa.total_debit_card || 0)}</td></tr>
      <tr><td class="label">Outros:</td><td class="value">${fmtCurr(caixa.total_other || 0)}</td></tr>
    </table>
    <div class="divider"></div>
    <table>
      <tr><td class="label"><strong>Total Recebido:</strong></td><td class="value"><strong>${fmtCurr(totalReceivedVal)}</strong></td></tr>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Conferência de Caixa</div>
    <table>
      <tr><td class="label">Dinheiro Esperado em Caixa:</td><td class="value">${fmtCurr(expectedCashVal)}</td></tr>
      <tr><td class="label">Dinheiro Declarado:</td><td class="value">${fmtCurr(closedBalanceValue)}</td></tr>
      <tr><td class="label">Diferença:</td><td class="value ${diffVal === 0 ? 'diff-ok' : 'diff-bad'}">${diffVal >= 0 ? "+" : ""}${fmtCurr(diffVal)}</td></tr>
    </table>
  </div>

  ${totalCredits > 0 || totalDebts > 0 ? `
  <div class="section">
    <div class="section-title">Créditos e Dívidas</div>
    <table>
      ${totalCredits > 0 ? `<tr><td class="label">Créditos gerados:</td><td class="value diff-ok">${fmtCurr(totalCredits)}</td></tr>` : ""}
      ${totalDebts > 0 ? `<tr><td class="label">Dívidas registradas:</td><td class="value diff-bad">${fmtCurr(totalDebts)}</td></tr>` : ""}
    </table>
  </div>` : ""}

  ${closedNotes ? `
  <div class="section">
    <div class="section-title">Observações</div>
    <p>${closedNotes}</p>
  </div>` : ""}

  <div class="footer">Sistema NP — Relatório gerado automaticamente</div>
</body></html>`;

    const printWindow = window.open("", "_blank", "width=800,height=900");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  if (!caixa) return null;

  const totalReceived = 
    (caixa.total_cash || 0) + 
    (caixa.total_pix || 0) + 
    (caixa.total_credit_card || 0) + 
    (caixa.total_debit_card || 0) + 
    (caixa.total_other || 0);

  const expectedCash = (caixa.opening_balance || 0) + (caixa.total_cash || 0);

  const hasOpenComandas = openComandasCount > 0;

  if (showSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleDismiss}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Caixa Fechado</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex flex-col items-center gap-3 text-center">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="text-lg font-semibold">Caixa fechado com sucesso!</h3>
              <p className="text-sm text-muted-foreground">
                Você pode imprimir ou gerar o PDF do relatório de fechamento.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button variant="outline" className="gap-2" onClick={handlePrintCaixaReport}>
                <Printer className="h-4 w-4" />
                Imprimir Relatório
              </Button>
              <Button variant="outline" className="gap-2" onClick={handlePrintCaixaReport}>
                <FileText className="h-4 w-4" />
                Gerar PDF
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleDismiss}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Fechar Caixa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Warning for open comandas */}
          {checkingComandas ? (
            <div className="flex items-center justify-center py-2">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span className="text-sm text-muted-foreground">Verificando comandas...</span>
            </div>
          ) : hasOpenComandas && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Existem <strong>{openComandasCount} comanda{openComandasCount > 1 ? "s" : ""} aberta{openComandasCount > 1 ? "s" : ""}</strong> vinculada{openComandasCount > 1 ? "s" : ""} a este caixa.
                Feche todas as comandas antes de fechar o caixa.
              </AlertDescription>
            </Alert>
          )}

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

              {/* Credits and Debts */}
              {(totalCredits > 0 || totalDebts > 0) && (
                <div className="border-t pt-3 space-y-2">
                  {totalCredits > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-green-600">
                        <Gift className="h-3.5 w-3.5" />
                        Créditos gerados para clientes:
                      </span>
                      <span className="text-green-600 font-medium">{formatCurrency(totalCredits)}</span>
                    </div>
                  )}
                  {totalDebts > 0 && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-1.5 text-destructive">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Dívidas registradas de clientes:
                      </span>
                      <span className="text-destructive font-medium">{formatCurrency(totalDebts)}</span>
                    </div>
                  )}
                </div>
              )}
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
              disabled={hasOpenComandas}
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
              disabled={hasOpenComandas}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || hasOpenComandas || checkingComandas}
          >
            {isLoading ? "Fechando..." : "Fechar Caixa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
