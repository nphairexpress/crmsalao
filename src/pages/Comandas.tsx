import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, MoreHorizontal, Loader2, Receipt, CheckCircle, Clock } from "lucide-react";
import { useComandas, Comanda, ComandaInput } from "@/hooks/useComandas";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Comandas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState<ComandaInput>({
    client_id: null,
    professional_id: null,
  });

  const { comandas, isLoading, createComanda, closeComanda, isCreating, isClosing } = useComandas();
  const { clients } = useClients();
  const { professionals } = useProfessionals();

  const filteredComandas = comandas.filter((comanda) => {
    const clientName = comanda.client?.name?.toLowerCase() || "";
    const professionalName = comanda.professional?.name?.toLowerCase() || "";
    return (
      clientName.includes(searchQuery.toLowerCase()) ||
      professionalName.includes(searchQuery.toLowerCase())
    );
  });

  const openComandas = filteredComandas.filter((c) => !c.closed_at);
  const closedComandas = filteredComandas.filter((c) => c.closed_at);

  const handleCreate = () => {
    createComanda(formData);
    setModalOpen(false);
    setFormData({ client_id: null, professional_id: null });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
  };

  if (isLoading) {
    return (
      <AppLayout title="Comandas">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Comandas">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente ou profissional..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Nova Comanda
          </Button>
        </div>

        {/* Comandas Abertas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Comandas Abertas ({openComandas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {openComandas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>Nenhuma comanda aberta</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openComandas.map((comanda) => (
                    <TableRow key={comanda.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{comanda.client?.name || "Cliente não definido"}</span>
                        </div>
                      </TableCell>
                      <TableCell>{comanda.professional?.name || "-"}</TableCell>
                      <TableCell>
                        {format(new Date(comanda.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(comanda.total)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => closeComanda(comanda.id)} disabled={isClosing}>
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Fechar Comanda
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Comandas Fechadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Comandas Fechadas ({closedComandas.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {closedComandas.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                <p>Nenhuma comanda fechada</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Profissional</TableHead>
                    <TableHead>Fechada em</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {closedComandas.map((comanda) => (
                    <TableRow key={comanda.id}>
                      <TableCell>
                        <span className="font-medium">{comanda.client?.name || "Cliente não definido"}</span>
                      </TableCell>
                      <TableCell>{comanda.professional?.name || "-"}</TableCell>
                      <TableCell>
                        {comanda.closed_at && format(new Date(comanda.closed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(comanda.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={comanda.is_paid ? "default" : "secondary"}>
                          {comanda.is_paid ? "Pago" : "Pendente"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal Nova Comanda */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Comanda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select
                value={formData.client_id || ""}
                onValueChange={(value) => setFormData({ ...formData, client_id: value || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Profissional</Label>
              <Select
                value={formData.professional_id || ""}
                onValueChange={(value) => setFormData({ ...formData, professional_id: value || null })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um profissional" />
                </SelectTrigger>
                <SelectContent>
                  {professionals.map((prof) => (
                    <SelectItem key={prof.id} value={prof.id}>
                      {prof.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={isCreating}>
              {isCreating ? "Criando..." : "Criar Comanda"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
