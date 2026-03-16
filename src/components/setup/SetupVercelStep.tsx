import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rocket, ArrowLeft, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import type { SetupData } from "@/pages/SetupWizard";

interface Props {
  data: SetupData;
  updateData: (d: Partial<SetupData>) => void;
  onDone: () => void;
  onBack: () => void;
  toast: any;
}

export default function SetupVercelStep({ data, updateData, onDone, onBack, toast }: Props) {
  const [loading, setLoading] = useState(false);

  const handleFinish = async () => {
    if (!data.vercelToken.trim() || !data.vercelProjectId.trim()) {
      toast({ title: "Preencha o Token e o Project ID da Vercel", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      // 1. Create dynamic Supabase client with provided credentials
      const dynamicClient = createClient(data.supabaseUrl.trim(), data.supabaseAnonKey.trim(), {
        auth: { persistSession: false },
      });

      const serviceClient = createClient(data.supabaseUrl.trim(), data.supabaseServiceRoleKey.trim(), {
        auth: { persistSession: false },
      });

      // 2. Sign up master user
      const { data: signUpData, error: signUpError } = await dynamicClient.auth.signUp({
        email: data.masterEmail,
        password: data.masterPassword,
        options: { data: { full_name: data.masterName } },
      });
      if (signUpError) throw signUpError;
      if (!signUpData.user) throw new Error("Erro ao criar usuário");

      // 3. Create salon using service role client (bypasses RLS)
      const { data: salon, error: salonError } = await serviceClient
        .from("salons")
        .insert({
          name: data.salonName,
          trade_name: data.tradeName || data.salonName,
          phone: data.salonPhone || null,
          email: data.salonEmail || null,
          cnpj: data.salonCnpj || null,
        })
        .select("id")
        .single();

      if (salonError || !salon?.id) throw salonError || new Error("Erro ao criar salão");

      // 4. Create profile
      const { error: profileError } = await serviceClient.from("profiles").insert({
        user_id: signUpData.user.id,
        salon_id: salon.id,
        full_name: data.masterName,
      });
      if (profileError) throw profileError;

      // 5. Create admin role
      const { error: roleError } = await serviceClient.from("user_roles").insert({
        user_id: signUpData.user.id,
        salon_id: salon.id,
        role: "admin",
      });
      if (roleError) throw roleError;

      // 6. Seed default access levels (call edge function with service role)
      try {
        // Sign in to get a valid token for the edge function
        const { data: signInData, error: signInError } = await dynamicClient.auth.signInWithPassword({
          email: data.masterEmail,
          password: data.masterPassword,
        });
        if (!signInError && signInData?.session) {
          const authedClient = createClient(data.supabaseUrl.trim(), data.supabaseAnonKey.trim(), {
            global: { headers: { Authorization: `Bearer ${signInData.session.access_token}` } },
            auth: { persistSession: false },
          });
          // Try to seed access levels via the create-salon function
          // (it will detect existing profile and just return salonId)
          await authedClient.functions.invoke("create-salon", {
            body: { fullName: data.masterName, salonName: data.salonName },
          });
        }
      } catch {
        // Non-critical - access levels can be created later
        console.warn("Could not seed access levels via edge function");
      }

      // 7. Set RESEND_API_KEY as Supabase secret via Vercel env vars approach
      // (The Resend key needs to be a Supabase secret, we'll note it for manual setup)

      // 8. Set Vercel env vars and trigger redeploy
      const envVars = [
        { key: "VITE_SUPABASE_URL", value: data.supabaseUrl.trim(), target: ["production", "preview"] },
        { key: "VITE_SUPABASE_PUBLISHABLE_KEY", value: data.supabaseAnonKey.trim(), target: ["production", "preview"] },
        { key: "VITE_SUPABASE_PROJECT_ID", value: extractProjectId(data.supabaseUrl.trim()), target: ["production", "preview"] },
      ];

      // Set env vars on Vercel
      for (const env of envVars) {
        // Try to create, if exists, patch it
        const createRes = await fetch(`https://api.vercel.com/v10/projects/${data.vercelProjectId}/env`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${data.vercelToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ key: env.key, value: env.value, target: env.target, type: "plain" }),
        });

        if (!createRes.ok) {
          const errBody = await createRes.json().catch(() => ({}));
          // If already exists, try to update
          if (errBody?.error?.code === "ENV_ALREADY_EXISTS") {
            // Get existing env var ID
            const listRes = await fetch(`https://api.vercel.com/v9/projects/${data.vercelProjectId}/env`, {
              headers: { Authorization: `Bearer ${data.vercelToken}` },
            });
            const listData = await listRes.json();
            const existing = listData?.envs?.find((e: any) => e.key === env.key);
            if (existing) {
              await fetch(`https://api.vercel.com/v9/projects/${data.vercelProjectId}/env/${existing.id}`, {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${data.vercelToken}`,
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ value: env.value, target: env.target, type: "plain" }),
              });
            }
          } else {
            console.error("Vercel env error:", errBody);
          }
        }
      }

      // 9. Trigger Vercel redeploy
      const deployRes = await fetch(`https://api.vercel.com/v13/deployments`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${data.vercelToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.vercelProjectId,
          project: data.vercelProjectId,
          target: "production",
          gitSource: undefined,
        }),
      });

      if (!deployRes.ok) {
        // Try alternative: create deployment from latest
        const redeployRes = await fetch(
          `https://api.vercel.com/v13/deployments?forceNew=1&projectId=${data.vercelProjectId}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${data.vercelToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ name: data.vercelProjectId, target: "production" }),
          }
        );
        if (!redeployRes.ok) {
          const err = await redeployRes.json().catch(() => ({}));
          console.warn("Redeploy warning:", err);
          // Don't throw - setup is complete, just redeploy failed
          toast({
            title: "⚠️ Setup concluído, mas o redeploy automático falhou",
            description: "Faça o redeploy manualmente na Vercel. O banco de dados já está configurado.",
          });
          onDone();
          return;
        }
      }

      toast({ title: "🎉 Setup concluído! Redeploy em andamento na Vercel." });
      onDone();
    } catch (err: any) {
      console.error("Setup error:", err);
      toast({ title: "Erro no setup", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Deploy na Vercel
        </CardTitle>
        <CardDescription>
          Configure a Vercel para conectar o frontend ao banco de dados e fazer o redeploy automático
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Vercel Token *</Label>
          <Input
            type="password"
            value={data.vercelToken}
            onChange={(e) => updateData({ vercelToken: e.target.value })}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxx"
          />
        </div>
        <div className="space-y-2">
          <Label>Vercel Project ID *</Label>
          <Input
            value={data.vercelProjectId}
            onChange={(e) => updateData({ vercelProjectId: e.target.value })}
            placeholder="prj_xxxxxxxxxxxxxxxxxxxxx"
          />
        </div>

        <div className="rounded-lg border bg-muted/50 p-3 text-xs text-muted-foreground space-y-1">
          <p className="font-medium text-foreground">📋 Onde encontrar:</p>
          <p>
            1. Acesse{" "}
            <a href="https://vercel.com/account/tokens" target="_blank" rel="noopener" className="text-primary underline inline-flex items-center gap-1">
              vercel.com/account/tokens <ExternalLink className="h-3 w-3" />
            </a>{" "}
            → <strong>Create Token</strong>
          </p>
          <p>2. Para o Project ID, vá em <strong>Settings</strong> → <strong>General</strong> do seu projeto na Vercel</p>
        </div>

        {data.resendKey && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-3 text-xs text-amber-800 dark:text-amber-200 space-y-1">
            <p className="font-medium">⚠️ Lembrete sobre Resend:</p>
            <p>Após o deploy, configure a variável <strong>RESEND_API_KEY</strong> nos Secrets do Supabase (Settings → Edge Functions → Secrets).</p>
          </div>
        )}

        <div className="rounded-lg border bg-primary/5 p-3 text-sm text-foreground">
          <p className="font-medium mb-1">🚀 O que vai acontecer:</p>
          <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
            <li>Criar o usuário master no banco de dados</li>
            <li>Criar o salão com as informações fornecidas</li>
            <li>Configurar as variáveis de ambiente na Vercel</li>
            <li>Fazer o redeploy automático</li>
            <li>Após o deploy, o sistema estará pronto para login</li>
          </ol>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={onBack} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <Button onClick={handleFinish} disabled={loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
            Instalar e Fazer Deploy
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function extractProjectId(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.split(".")[0];
  } catch {
    return "";
  }
}
