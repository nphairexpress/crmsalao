import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Database, ArrowRight, Loader2, CheckCircle2, XCircle } from "lucide-react";
import type { SetupData } from "@/pages/SetupWizard";

interface Props {
  data: SetupData;
  updateData: (d: Partial<SetupData>) => void;
  onNext: () => void;
}

export default function SetupSupabaseStep({ data, updateData, onNext }: Props) {
  const { toast } = useToast();
  const [testing, setTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  const handleTest = async () => {
    if (!data.supabaseUrl.trim() || !data.supabaseAnonKey.trim() || !data.supabaseServiceRoleKey.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }

    setTesting(true);
    setConnectionStatus("idle");

    try {
      const testClient = createClient(data.supabaseUrl.trim(), data.supabaseAnonKey.trim(), {
        auth: { persistSession: false },
      });

      // Test connection by querying salons table
      const { error } = await testClient.from("salons").select("id", { count: "exact", head: true });

      if (error) throw error;

      setConnectionStatus("success");
      toast({ title: "✅ Conexão estabelecida com sucesso!" });
    } catch (err: any) {
      setConnectionStatus("error");
      toast({
        title: "Falha na conexão",
        description: err.message || "Verifique as credenciais e tente novamente",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Conexão com o Banco de Dados
        </CardTitle>
        <CardDescription>
          Insira as credenciais do seu projeto Supabase para conectar o sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Supabase URL *</Label>
          <Input
            value={data.supabaseUrl}
            onChange={(e) => updateData({ supabaseUrl: e.target.value })}
            placeholder="https://xxxxx.supabase.co"
          />
        </div>
        <div className="space-y-2">
          <Label>Anon Key (Publishable) *</Label>
          <Input
            type="password"
            value={data.supabaseAnonKey}
            onChange={(e) => updateData({ supabaseAnonKey: e.target.value })}
            placeholder="eyJhbGciOiJIUz..."
          />
        </div>
        <div className="space-y-2">
          <Label>Service Role Key *</Label>
          <Input
            type="password"
            value={data.supabaseServiceRoleKey}
            onChange={(e) => updateData({ supabaseServiceRoleKey: e.target.value })}
            placeholder="eyJhbGciOiJIUz..."
          />
          <p className="text-xs text-muted-foreground">
            ⚠️ Essa chave será usada apenas durante a instalação e não será armazenada no frontend.
          </p>
        </div>

        {connectionStatus === "success" && (
          <div className="flex items-center gap-2 text-primary text-sm font-medium">
            <CheckCircle2 className="h-4 w-4" /> Conexão OK
          </div>
        )}
        {connectionStatus === "error" && (
          <div className="flex items-center gap-2 text-destructive text-sm font-medium">
            <XCircle className="h-4 w-4" /> Falha na conexão
          </div>
        )}

        <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">📋 Onde encontrar:</p>
          <p>1. Acesse o painel do Supabase → Seu projeto → <strong>Settings</strong> → <strong>API</strong></p>
          <p>2. Copie a <strong>Project URL</strong>, <strong>anon public</strong> key e <strong>service_role</strong> key</p>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleTest} disabled={testing} className="gap-2">
            {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Database className="h-4 w-4" />}
            Testar Conexão
          </Button>
          <Button onClick={onNext} disabled={connectionStatus !== "success"} className="gap-2">
            Próximo <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
