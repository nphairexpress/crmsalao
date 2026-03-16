import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export default function SetupDoneStep() {
  return (
    <Card className="text-center py-12">
      <CardContent className="space-y-4">
        <CheckCircle2 className="h-16 w-16 mx-auto text-green-500" />
        <h2 className="text-2xl font-bold">Instalação Concluída! 🎉</h2>
        <p className="text-muted-foreground">
          O banco de dados foi configurado e o redeploy foi iniciado na Vercel.
          <br />
          Aguarde alguns minutos e acesse o sistema novamente para fazer login.
        </p>
        <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground max-w-md mx-auto">
          <p className="font-medium text-foreground mb-2">📋 Próximos passos:</p>
          <ol className="list-decimal list-inside space-y-1 text-left">
            <li>Aguarde o deploy finalizar na Vercel (~1-2 min)</li>
            <li>Acesse a URL do sistema</li>
            <li>Faça login com o e-mail e senha do usuário master</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
