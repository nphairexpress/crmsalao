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
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Client, ClientInput } from "@/hooks/useClients";

interface ClientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSubmit: (data: ClientInput & { id?: string }) => void;
  isLoading?: boolean;
}

const BRAZILIAN_STATES = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const initialFormData: ClientInput = {
  name: "",
  email: "",
  phone: "",
  phone_landline: "",
  birth_date: "",
  notes: "",
  tags: [],
  gender: "prefer_not_say",
  cpf: "",
  rg: "",
  cep: "",
  state: "",
  city: "",
  neighborhood: "",
  address: "",
  address_number: "",
  address_complement: "",
  how_met: "",
  profession: "",
  allow_email_campaigns: true,
  allow_sms_campaigns: true,
  allow_online_booking: true,
  add_cpf_invoice: true,
  allow_ai_service: true,
  allow_whatsapp_campaigns: true,
};

export function ClientModal({ open, onOpenChange, client, onSubmit, isLoading }: ClientModalProps) {
  const [formData, setFormData] = useState<ClientInput>(initialFormData);

  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        email: client.email || "",
        phone: client.phone || "",
        phone_landline: client.phone_landline || "",
        birth_date: client.birth_date || "",
        notes: client.notes || "",
        tags: client.tags || [],
        gender: client.gender || "prefer_not_say",
        cpf: client.cpf || "",
        rg: client.rg || "",
        cep: client.cep || "",
        state: client.state || "",
        city: client.city || "",
        neighborhood: client.neighborhood || "",
        address: client.address || "",
        address_number: client.address_number || "",
        address_complement: client.address_complement || "",
        how_met: client.how_met || "",
        profession: client.profession || "",
        allow_email_campaigns: client.allow_email_campaigns ?? true,
        allow_sms_campaigns: client.allow_sms_campaigns ?? true,
        allow_online_booking: client.allow_online_booking ?? true,
        add_cpf_invoice: client.add_cpf_invoice ?? true,
        allow_ai_service: client.allow_ai_service ?? true,
        allow_whatsapp_campaigns: client.allow_whatsapp_campaigns ?? true,
      });
    } else {
      setFormData(initialFormData);
    }
  }, [client, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (client) {
      onSubmit({ ...formData, id: client.id });
    } else {
      onSubmit(formData);
    }
    onOpenChange(false);
  };

  const updateField = (field: keyof ClientInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{client ? "Editar Cliente" : "Cadastre um novo cliente"}</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="cadastro" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
            <TabsTrigger value="anamnese">Anamnese</TabsTrigger>
          </TabsList>
          <form onSubmit={handleSubmit}>
            <ScrollArea className="h-[60vh] pr-4">
              <TabsContent value="cadastro" className="space-y-6 mt-4">
                {/* Nome e Data de Aniversário */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome conforme documento (Obrigatório):</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => updateField("name", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birth_date">Data de Aniversário:</Label>
                    <Input
                      id="birth_date"
                      type="date"
                      value={formData.birth_date}
                      onChange={(e) => updateField("birth_date", e.target.value)}
                    />
                  </div>
                </div>

                {/* Celular e Telefone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular:</Label>
                    <div className="flex gap-2">
                      <Input className="w-20" value="+55" disabled />
                      <Input
                        id="phone"
                        placeholder="(11) 99999-9999"
                        value={formData.phone}
                        onChange={(e) => updateField("phone", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone_landline">Telefone:</Label>
                    <div className="flex gap-2">
                      <Input className="w-20" value="+55" disabled />
                      <Input
                        id="phone_landline"
                        placeholder="(11) 99999-9999"
                        value={formData.phone_landline}
                        onChange={(e) => updateField("phone_landline", e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>

                {/* Gênero */}
                <div className="space-y-2">
                  <Label>Gênero:</Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => updateField("gender", value)}
                    className="flex flex-wrap gap-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="male" id="male" />
                      <Label htmlFor="male" className="font-normal">Masculino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="female" id="female" />
                      <Label htmlFor="female" className="font-normal">Feminino</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="other" id="other" />
                      <Label htmlFor="other" className="font-normal">Outro</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="prefer_not_say" id="prefer_not_say" />
                      <Label htmlFor="prefer_not_say" className="font-normal">Prefiro não dizer</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* CPF e RG */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF:</Label>
                    <Input
                      id="cpf"
                      value={formData.cpf}
                      onChange={(e) => updateField("cpf", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rg">RG:</Label>
                    <Input
                      id="rg"
                      value={formData.rg}
                      onChange={(e) => updateField("rg", e.target.value)}
                    />
                  </div>
                </div>

                {/* Email e CEP */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail:</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP:</Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => updateField("cep", e.target.value)}
                    />
                  </div>
                </div>

                {/* Estado, Cidade, Bairro */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">Estado:</Label>
                    <Select value={formData.state} onValueChange={(value) => updateField("state", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um estado" />
                      </SelectTrigger>
                      <SelectContent>
                        {BRAZILIAN_STATES.map((state) => (
                          <SelectItem key={state.value} value={state.value}>
                            {state.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Cidade:</Label>
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="neighborhood">Bairro:</Label>
                    <Input
                      id="neighborhood"
                      value={formData.neighborhood}
                      onChange={(e) => updateField("neighborhood", e.target.value)}
                    />
                  </div>
                </div>

                {/* Endereço, Número, Complemento */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address">Endereço:</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => updateField("address", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_number">Número:</Label>
                    <Input
                      id="address_number"
                      value={formData.address_number}
                      onChange={(e) => updateField("address_number", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address_complement">Complemento:</Label>
                    <Input
                      id="address_complement"
                      value={formData.address_complement}
                      onChange={(e) => updateField("address_complement", e.target.value)}
                    />
                  </div>
                </div>

                {/* Observação e Como conheceu + Profissão */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observação:</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => updateField("notes", e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="how_met">Como conheceu?</Label>
                      <Input
                        id="how_met"
                        value={formData.how_met}
                        onChange={(e) => updateField("how_met", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profession">Profissão:</Label>
                      <Input
                        id="profession"
                        value={formData.profession}
                        onChange={(e) => updateField("profession", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Permissões */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Permissões:</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_email_campaigns"
                        checked={formData.allow_email_campaigns}
                        onCheckedChange={(checked) => updateField("allow_email_campaigns", checked)}
                      />
                      <Label htmlFor="allow_email_campaigns" className="font-normal text-sm">
                        Campanhas de <strong>e-mail</strong>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_sms_campaigns"
                        checked={formData.allow_sms_campaigns}
                        onCheckedChange={(checked) => updateField("allow_sms_campaigns", checked)}
                      />
                      <Label htmlFor="allow_sms_campaigns" className="font-normal text-sm">
                        Campanhas de <strong>sms</strong>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_online_booking"
                        checked={formData.allow_online_booking}
                        onCheckedChange={(checked) => updateField("allow_online_booking", checked)}
                      />
                      <Label htmlFor="allow_online_booking" className="font-normal text-sm">
                        Agendamento online
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="add_cpf_invoice"
                        checked={formData.add_cpf_invoice}
                        onCheckedChange={(checked) => updateField("add_cpf_invoice", checked)}
                      />
                      <Label htmlFor="add_cpf_invoice" className="font-normal text-sm">
                        Adicionar CPF na Nota Fiscal
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_ai_service"
                        checked={formData.allow_ai_service}
                        onCheckedChange={(checked) => updateField("allow_ai_service", checked)}
                      />
                      <Label htmlFor="allow_ai_service" className="font-normal text-sm">
                        Atendimento por <strong>IA</strong>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="allow_whatsapp_campaigns"
                        checked={formData.allow_whatsapp_campaigns}
                        onCheckedChange={(checked) => updateField("allow_whatsapp_campaigns", checked)}
                      />
                      <Label htmlFor="allow_whatsapp_campaigns" className="font-normal text-sm">
                        Campanhas de <strong>WhatsApp</strong>
                      </Label>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="anamnese" className="space-y-4 mt-4">
                <div className="flex items-center justify-center h-40 text-muted-foreground">
                  <p>Funcionalidade de anamnese em breve.</p>
                </div>
              </TabsContent>
            </ScrollArea>

            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Salvando..." : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
