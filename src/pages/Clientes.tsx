import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  UserPlus,
} from "lucide-react";

interface Client {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  lastVisit: string;
  totalSpent: number;
  visits: number;
  tags: string[];
  status: "active" | "inactive" | "new";
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Maria Silva",
    initials: "MS",
    email: "maria.silva@email.com",
    phone: "(11) 99999-1234",
    lastVisit: "15/01/2025",
    totalSpent: 2450,
    visits: 12,
    tags: ["VIP", "Coloração"],
    status: "active",
  },
  {
    id: "2",
    name: "Juliana Santos",
    initials: "JS",
    email: "juliana.santos@email.com",
    phone: "(11) 98888-5678",
    lastVisit: "14/01/2025",
    totalSpent: 1890,
    visits: 8,
    tags: ["Frequente"],
    status: "active",
  },
  {
    id: "3",
    name: "Fernanda Costa",
    initials: "FC",
    email: "fernanda.costa@email.com",
    phone: "(11) 97777-9012",
    lastVisit: "10/01/2025",
    totalSpent: 3200,
    visits: 15,
    tags: ["VIP", "Manicure"],
    status: "active",
  },
  {
    id: "4",
    name: "Patricia Lima",
    initials: "PL",
    email: "patricia.lima@email.com",
    phone: "(11) 96666-3456",
    lastVisit: "05/12/2024",
    totalSpent: 560,
    visits: 3,
    tags: [],
    status: "inactive",
  },
  {
    id: "5",
    name: "Camila Alves",
    initials: "CA",
    email: "camila.alves@email.com",
    phone: "(11) 95555-7890",
    lastVisit: "16/01/2025",
    totalSpent: 180,
    visits: 1,
    tags: ["Novo"],
    status: "new",
  },
  {
    id: "6",
    name: "Amanda Souza",
    initials: "AS",
    email: "amanda.souza@email.com",
    phone: "(11) 94444-1234",
    lastVisit: "12/01/2025",
    totalSpent: 4500,
    visits: 22,
    tags: ["VIP", "Fidelidade"],
    status: "active",
  },
];

const statusConfig = {
  active: { label: "Ativo", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300" },
  inactive: { label: "Inativo", className: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300" },
  new: { label: "Novo", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" },
};

export default function Clientes() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = mockClients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone.includes(searchQuery)
  );

  const totalClients = mockClients.length;
  const activeClients = mockClients.filter((c) => c.status === "active").length;
  const newClientsThisMonth = mockClients.filter((c) => c.status === "new").length;

  return (
    <AppLayout title="Clientes">
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalClients}</p>
                  <p className="text-sm text-muted-foreground">Total de Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{activeClients}</p>
                  <p className="text-sm text-muted-foreground">Clientes Ativos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{newClientsThisMonth}</p>
                  <p className="text-sm text-muted-foreground">Novos este mês</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email ou telefone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Clients Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Contato</TableHead>
                  <TableHead className="hidden lg:table-cell">Última Visita</TableHead>
                  <TableHead className="hidden lg:table-cell">Visitas</TableHead>
                  <TableHead>Total Gasto</TableHead>
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
                          <AvatarFallback className="bg-primary/10 text-primary text-sm">
                            {client.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{client.name}</span>
                            <Badge variant="secondary" className={statusConfig[client.status].className}>
                              {statusConfig[client.status].label}
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground md:hidden">
                            {client.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          <span>{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {client.lastVisit}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {client.visits}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        R$ {client.totalSpent.toLocaleString("pt-BR")}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {client.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Ver Perfil</DropdownMenuItem>
                          <DropdownMenuItem>Novo Agendamento</DropdownMenuItem>
                          <DropdownMenuItem>Histórico</DropdownMenuItem>
                          <DropdownMenuItem>Editar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
