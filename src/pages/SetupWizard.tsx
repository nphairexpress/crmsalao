import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Building2, User, Key, CheckCircle2, ArrowRight, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";

type Step = "salon" | "master" | "integrations" | "done";

const STEPS: { key: Step; label: string; icon: any }[] = [
  { key: "salon", label: "Salão", icon: Building2 },
  { key: "master", label: "Usuário Master", icon: User },
  { key: "integrations", label: "Integrações", icon: Key },
  { key: "done", label: "Pronto!", icon: CheckCircle2 },
];

export default function SetupWizard() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<Step>("salon");
  const [loading, setLoading] = useState(false);

  // Salon data
  const [salonName, setSalonName] = useState("");
  const [tradeName, setTradeName] = useState("");
  const [salonPhone, setSalonPhone] = useState("");
  const [salonEmail, setSalonEmail] = useState("");
  const [salonCnpj, setSalonCnpj] = useState("");

  // Master user
  const [masterName, setMasterName] = useState("");
  const [masterEmail, setMasterEmail] = useState("");
  const [masterPassword, setMasterPassword] = useState("");

  // Resend
  const [resendKey, setResendKey] = useState("");

  const stepIndex = STEPS.findIndex(s => s.key === currentStep);

  const handleCreateSalon = async () => {
    if (!salonName.trim()) {
      toast({ title: "Preencha o nome do salão", variant: "destructive" });
      return;
    }
    setCurrentStep("master");
  };

  const handleCreateMaster = async () => {
    if (!masterName.trim() || !masterEmail.trim() || !masterPassword.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    if (masterPassword.length < 6) {
      toast({ title: "A senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setCurrentStep("integrations");
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // 1. Sign up master user
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: masterEmail,
        password: masterPassword,
        options: { data: { full_name: masterName } },
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Erro ao criar usuário");

      // 2. Sign in immediately
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: masterEmail,
        password: masterPassword,
      });
      if (signInError) throw signInError;

      // 3. Create salon via edge function
      const { data: salonData, error: salonError } = await supabase.functions.invoke("create-salon", {
        body: {
          fullName: masterName,
          salonName: salonName,
        },
      });
      if (salonError) throw salonError;

      const salonId = (salonData as any)?.salonId;
      if (!salonId) throw new Error("Erro ao criar salão");

      // 4. Update salon with additional info
      await supabase.from("salons").update({
        trade_name: tradeName || salonName,
        phone: salonPhone || null,
        email: salonEmail || null,
        cnpj: salonCnpj || null,
      }).eq("id", salonId);

      // 5. Set master email in system_config
      await supabase.from("system_config").upsert({
        key: "master_user_email",
        value: masterEmail,
      }, { onConflict: "key" });

      // 6. Save Resend key if provided (via edge function)
      if (resendKey.trim()) {
        await supabase.functions.invoke("save-setup-config", {
          body: { resend_api_key: resendKey },
        });
      }

      toast({ title: "🎉 Setup concluído com sucesso!" });
      setCurrentStep("done");

      // Reload after 2s to enter the app
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err: any) {
      console.error("Setup error:", err);
      toast({ title: "Erro no setup", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                i <= stepIndex ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}>
                {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
              </div>
              <span className={`text-sm hidden sm:inline ${i <= stepIndex ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {step.label}
              </span>
              {i < STEPS.length - 1 && <div className={`w-8 h-0.5 ${i < stepIndex ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Salon */}
        {currentStep === "salon" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Dados do Salão
              </CardTitle>
              <CardDescription>Preencha as informações do seu estabelecimento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Razão Social *</Label>
                  <Input value={salonName} onChange={e => setSalonName(e.target.value)} placeholder="Ex: NP Hair Studio LTDA" />
                </div>
                <div className="space-y-2">
                  <Label>Nome Fantasia</Label>
                  <Input value={tradeName} onChange={e => setTradeName(e.target.value)} placeholder="Ex: NP Hair Studio" />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ</Label>
                  <Input value={salonCnpj} onChange={e => setSalonCnpj(e.target.value)} placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input value={salonPhone} onChange={e => setSalonPhone(e.target.value)} placeholder="(11) 94068-1490" />
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label>E-mail do Salão</Label>
                  <Input value={salonEmail} onChange={e => setSalonEmail(e.target.value)} placeholder="contato@seusalao.com.br" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleCreateSalon} className="gap-2">
                  Próximo <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Master User */}
        {currentStep === "master" && (
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
                  <Input value={masterName} onChange={e => setMasterName(e.target.value)} placeholder="Seu nome completo" />
                </div>
                <div className="space-y-2">
                  <Label>E-mail de Login *</Label>
                  <Input type="email" value={masterEmail} onChange={e => setMasterEmail(e.target.value)} placeholder="seu@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Senha *</Label>
                  <Input type="password" value={masterPassword} onChange={e => setMasterPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
                </div>
              </div>

              <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
                <p>⚠️ <strong>Importante:</strong> Este será o único usuário com acesso total ao sistema (Master). Outros usuários podem ser criados depois via cadastro de profissionais.</p>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep("salon")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleCreateMaster} className="gap-2">
                  Próximo <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Integrations */}
        {currentStep === "integrations" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Integrações
              </CardTitle>
              <CardDescription>Configure as integrações de e-mail (opcional — pode fazer depois)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Resend */}
              <div className="space-y-3 rounded-lg border p-4">
                <h3 className="font-semibold flex items-center gap-2">📧 Resend (E-mails automáticos)</h3>
                <div className="space-y-2">
                  <Label>API Key do Resend</Label>
                  <Input
                    type="password"
                    value={resendKey}
                    onChange={e => setResendKey(e.target.value)}
                    placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
                  <p className="font-medium text-foreground">📋 Passo a passo:</p>
                  <p>1. Acesse <a href="https://resend.com/signup" target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-1">resend.com <ExternalLink className="h-3 w-3" /></a> e crie uma conta gratuita</p>
                  <p>2. No painel, vá em <strong>API Keys</strong> → <strong>Create API Key</strong></p>
                  <p>3. Copie a chave gerada e cole acima</p>
                  <p>4. Em <strong>Webhooks</strong> → <strong>Add Webhook</strong>, configure a URL:</p>
                  <code className="block bg-background p-1.5 rounded text-xs mt-1 break-all">
                    https://SEU-PROJETO.supabase.co/functions/v1/resend-webhook
                  </code>
                  <p>5. Selecione os eventos: <strong>email.delivered, email.opened, email.clicked, email.bounced, email.complained</strong></p>
                </div>
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep("master")} className="gap-2">
                  <ArrowLeft className="h-4 w-4" /> Voltar
                </Button>
                <Button onClick={handleFinish} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  {resendKey ? "Finalizar Setup" : "Pular e Finalizar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4: Done */}
        {currentStep === "done" && (
          <Card className="text-center py-12">
            <CardContent className="space-y-4">
              <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
              <h2 className="text-2xl font-bold">Setup Concluído! 🎉</h2>
              <p className="text-muted-foreground">
                Seu sistema está pronto. Redirecionando para o painel...
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
