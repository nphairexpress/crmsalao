import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import { AppLayoutNew } from "@/components/layout/AppLayoutNew";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Loader2, CalendarIcon } from "lucide-react";
import { useCaixas, Caixa } from "@/hooks/useCaixas";
import { useAuth } from "@/contexts/AuthContext";
import { CaixaCard } from "@/components/caixa/CaixaCard";
import { OpenCaixaModal } from "@/components/caixa/OpenCaixaModal";
import { CloseCaixaModal } from "@/components/caixa/CloseCaixaModal";
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export default function Financeiro() {
  const location = useLocation();
  const [openCaixaModalOpen, setOpenCaixaModalOpen] = useState(false);
  const [closeCaixaModalOpen, setCloseCaixaModalOpen] = useState(false);
  const [selectedCaixa, setSelectedCaixa] = useState<Caixa | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [userOpenCaixa, setUserOpenCaixa] = useState<Caixa | null>(null);

  const { user } = useAuth();
  const { 
    caixas, 
    openCaixas, 
    closedCaixas, 
    isLoading, 
    openCaixa, 
    closeCaixa, 
    getCurrentUserOpenCaixa,
    isOpening,
    isClosing,
  } = useCaixas();

  // Determine active tab from URL
  const isHistorico = location.pathname.includes("/historico");

  // Check if user has open caixa
  useEffect(() => {
    const checkUserCaixa = async () => {
      const caixa = await getCurrentUserOpenCaixa();
      setUserOpenCaixa(caixa);
    };
    checkUserCaixa();
  }, [caixas]);

  const handleOpenCaixa = (openingBalance: number, notes?: string) => {
    openCaixa({ opening_balance: openingBalance, notes }, {
      onSuccess: () => {
        setOpenCaixaModalOpen(false);
      }
    });
  };

  const handleCloseCaixa = (closingBalance: number, notes?: string) => {
    if (!selectedCaixa) return;
    closeCaixa({ caixaId: selectedCaixa.id, closingBalance, notes }, {
      onSuccess: () => {
        setCloseCaixaModalOpen(false);
        setSelectedCaixa(null);
      }
    });
  };

  const handleOpenCloseModal = (caixa: Caixa) => {
    setSelectedCaixa(caixa);
    setCloseCaixaModalOpen(true);
  };

  // Group closed caixas by date for history
  const caixasByDate = closedCaixas.filter(c => 
    isSameDay(new Date(c.opened_at), selectedDate)
  );

  // Get dates with caixas for the calendar
  const datesWithCaixas = closedCaixas.map(c => new Date(c.opened_at));

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
        {!isHistorico ? (
          // Caixas Abertos Tab
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">Caixas Abertos</h2>
                <Badge variant="outline" className="px-3">
                  {openCaixas.length} aberto{openCaixas.length !== 1 ? "s" : ""}
                </Badge>
              </div>
              <Button 
                className="gap-2" 
                onClick={() => setOpenCaixaModalOpen(true)}
                disabled={!!userOpenCaixa}
              >
                <Plus className="h-4 w-4" />
                Abrir Meu Caixa
              </Button>
            </div>

            {userOpenCaixa && (
              <Card className="border-primary">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-primary">Seu Caixa Aberto</CardTitle>
                </CardHeader>
                <CardContent>
                  <CaixaCard 
                    caixa={userOpenCaixa} 
                    showCloseButton 
                    onClose={() => handleOpenCloseModal(userOpenCaixa)}
                  />
                </CardContent>
              </Card>
            )}

            {openCaixas.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  Nenhum caixa aberto no momento
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {openCaixas
                  .filter(c => c.id !== userOpenCaixa?.id)
                  .map((caixa) => (
                    <CaixaCard 
                      key={caixa.id} 
                      caixa={caixa}
                    />
                  ))}
              </div>
            )}
          </>
        ) : (
          // Histórico de Caixas Tab
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Histórico de Caixas</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-1">
                <CardContent className="p-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    locale={ptBR}
                    className="rounded-md border-0"
                    modifiers={{
                      hasCaixa: datesWithCaixas,
                    }}
                    modifiersStyles={{
                      hasCaixa: {
                        backgroundColor: "hsl(var(--primary) / 0.1)",
                        fontWeight: "bold",
                      }
                    }}
                  />
                </CardContent>
              </Card>

              {/* Caixas for selected date */}
              <div className="lg:col-span-3 space-y-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  <h3 className="font-medium">
                    {format(selectedDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </h3>
                  <Badge variant="outline">
                    {caixasByDate.length} caixa{caixasByDate.length !== 1 ? "s" : ""}
                  </Badge>
                </div>

                {caixasByDate.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      Nenhum caixa fechado nesta data
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {caixasByDate.map((caixa) => (
                      <CaixaCard 
                        key={caixa.id} 
                        caixa={caixa}
                        onView={() => {/* TODO: implement detail view */}}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <OpenCaixaModal
        open={openCaixaModalOpen}
        onClose={() => setOpenCaixaModalOpen(false)}
        onConfirm={handleOpenCaixa}
        isLoading={isOpening}
      />

      <CloseCaixaModal
        open={closeCaixaModalOpen}
        onClose={() => {
          setCloseCaixaModalOpen(false);
          setSelectedCaixa(null);
        }}
        onConfirm={handleCloseCaixa}
        caixa={selectedCaixa}
        isLoading={isClosing}
      />
    </AppLayoutNew>
  );
}
