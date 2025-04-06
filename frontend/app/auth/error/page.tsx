"use client";

import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="container mx-auto flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-4">Erro de Autenticação</h1>
        <p className="text-muted-foreground mb-6">
          {error === "Configuration" && "Houve um erro na configuração do provedor de autenticação."}
          {error === "AccessDenied" && "Acesso negado. Você não tem permissão para fazer login."}
          {error === "Verification" && "O link de verificação expirou ou já foi usado."}
          {!error && "Ocorreu um erro durante a autenticação."}
        </p>
        <div className="flex justify-end">
          <Button asChild>
            <Link href="/auth/signin">Voltar para Login</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
} 