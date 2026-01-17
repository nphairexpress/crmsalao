import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Plus, MoreHorizontal, Phone, Mail, Loader2 } from "lucide-react";
import { useClients, Client, ClientInput } from "@/hooks/useClients";
import { ClientModal } from "@/components/modals/ClientModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";

export default function Clientes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const { clients, isLoading, createClient, updateClient, deleteClient, isCreating, isUpdating, isDeleting } = useClients();

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (client.phone?.includes(searchQuery))
  );

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setModalOpen(true);
  };

  const handleDelete = (client: Client) => {
    setSelectedClient(client);
    setDeleteOpen(true);
  };

  const handleSubmit = (data: ClientInput & { id?: string }) => {
    if (data.id) {
      updateClient(data as ClientInput & { id: string });
    } else {
      createClient(data);
    }
  };

  const getInitials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  if (isLoading) {
    return (
      <AppLayout title="Clientes">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Clientes">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome, email ou telefone..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Button className="gap-2" onClick={() => { setSelectedClient(null); setModalOpen(true); }}>
            <Plus className="h-4 w-4" />Novo Cliente
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            {filteredClients.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <p>Nenhum cliente encontrado</p>
                <Button variant="link" onClick={() => { setSelectedClient(null); setModalOpen(true); }}>Adicionar primeiro cliente</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead className="hidden md:table-cell">Contato</TableHead>
                    <TableHead className="hidden sm:table-cell">Tags</TableHead>
                    <TableHead className="w-10"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">{getInitials(client.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{client.name}</span>
                            <span className="text-sm text-muted-foreground md:hidden block">{client.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="space-y-1">
                          {client.phone && <div className="flex items-center gap-2 text-sm"><Phone className="h-3 w-3 text-muted-foreground" />{client.phone}</div>}
                          {client.email && <div className="flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-3 w-3" />{client.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {client.tags?.map((tag) => (<Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(client)}>Editar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDelete(client)} className="text-destructive">Excluir</DropdownMenuItem>
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
      </div>

      <ClientModal open={modalOpen} onOpenChange={setModalOpen} client={selectedClient} onSubmit={handleSubmit} isLoading={isCreating || isUpdating} />
      <DeleteConfirmModal open={deleteOpen} onOpenChange={setDeleteOpen} title="Excluir Cliente" description={`Tem certeza que deseja excluir "${selectedClient?.name}"?`} onConfirm={() => { if (selectedClient) { deleteClient(selectedClient.id); setDeleteOpen(false); } }} isLoading={isDeleting} />
    </AppLayout>
  );
}
