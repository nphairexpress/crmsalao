import { useState } from "react";
import { AppLayoutNew } from "@/components/layout/AppLayoutNew";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, MoreHorizontal, Loader2, Receipt, CheckCircle, Clock, Pencil, Trash2, Printer } from "lucide-react";
import { useComandas, Comanda, ComandaInput } from "@/hooks/useComandas";
import { useClients } from "@/hooks/useClients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Comandas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("abertas");
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

  const getComandaNumber = (comanda: Comanda) => {
    const date = new Date(comanda.created_at);
    const dateStr = format(date, "dd/MM/yyyy");
    return `Nº${comanda.id.slice(0, 4).toUpperCase()} (${dateStr})`;
  };

  if (isLoading) {
    return (
      <AppLayoutNew>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayoutNew>
    );
  }

  return (
    <AppLayoutNew>
      <div className="space-y-4">
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Abrir Comanda
          </Button>
          <Badge variant="outline" className="gap-1 px-3 py-1.5">
            Comandas Pendentes
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs ml-1">
              {openComandas.length}
            </span>
          </Badge>
        </div>

        {/* Table Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar</span>
            <Select defaultValue="10">
              <SelectTrigger className="w-20 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">por página</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">Print</Button>
            <Button variant="outline" size="sm">Excel</Button>
            <Button variant="outline" size="sm">PDF</Button>
            <div className="relative">
              <span className="text-sm text-muted-foreground mr-2">Buscar:</span>
              <Input 
                placeholder="" 
                className="w-48 h-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Comandas Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer hover:bg-muted/50">
                    Comanda ▼
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50">
                    Cliente ▼
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50">
                    Data de abertura ▼
                  </TableHead>
                  <TableHead className="cursor-pointer hover:bg-muted/50 text-right">
                    Valor ▼
                  </TableHead>
                  <TableHead className="text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(activeTab === "abertas" ? openComandas : closedComandas).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      Nenhuma comanda encontrada
                    </TableCell>
                  </TableRow>
                ) : (
                  (activeTab === "abertas" ? openComandas : closedComandas).map((comanda) => (
                    <TableRow key={comanda.id}>
                      <TableCell className="font-medium">
                        {getComandaNumber(comanda)}
                      </TableCell>
                      <TableCell className="uppercase">
                        {comanda.client?.name || "Cliente não definido"}
                      </TableCell>
                      <TableCell>
                        {format(new Date(comanda.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(comanda.total)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-primary hover:text-primary">
                            <Printer className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Mostrando 1 até {Math.min(10, openComandas.length)} de {openComandas.length} registros</span>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" disabled>← Anterior</Button>
            <Button variant="default" size="sm">1</Button>
            <Button variant="outline" size="sm">2</Button>
            <Button variant="outline" size="sm">Próximo →</Button>
          </div>
        </div>
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
    </AppLayoutNew>
  );
}