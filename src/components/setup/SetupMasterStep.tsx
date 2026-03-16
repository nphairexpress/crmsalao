import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { User, ArrowRight, ArrowLeft } from "lucide-react";
import type { SetupData } from "@/pages/SetupWizard";

interface Props {
  data: SetupData;
  updateData: (d: Partial<SetupData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function SetupMasterStep({ data, updateData, onNext, onBack }: Props) {
  const { toast } = useToast();

  const handleNext = () => {
    if (!data.masterName.trim() || !data.masterEmail.trim() || !data.masterPassword.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (data.masterPassword.length < 6) {
      toast({ title: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    onNext();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Usuário Master
        </CardTitle>
        <CardDescription>Crie a conta de administrador principal do sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label>Nome Completo *</Label>
            <Input value={data.masterName} onChange={(e) => updateData({ masterName: e.target.value })} placeholder="Seu nome completo" />
          </div>
          <div className="space-y-2">
            <Label>E-mail de Login *</Label>
            <Input type="email" value={data.masterEmail} onChange={(e) => updateData({ masterEmail: e.target.value })} placeholder="seu@email.com" />
          </div>
          <div className="space-y-2">
            <Label>Senha *</Label>
            <Input type="password" value={data.masterPassword} onChange={(e) => updateData({ masterPassword: e.target.value })} placeholder="Mínimo 6 caracteres" />
          </div>
        </div>
        <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
          <p>⚠️ <strong>Importante:</strong> Este será o único usuário com acesso total ao sistema (Master). Outros usuários podem ser criados depois via cadastro de profissionais.</p>
        </div>
        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button onClick={handleNext} className="gap-2">
            Próximo <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
