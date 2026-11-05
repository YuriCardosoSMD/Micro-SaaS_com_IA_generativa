"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isRegister = mode === "register";

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const body = Object.fromEntries(form.entries());

    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Algo deu errado");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card mx-auto mt-12 max-w-md">
      <h1 className="mb-6 text-2xl font-bold">{isRegister ? "Criar conta" : "Entrar"}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isRegister && (
          <div>
            <label htmlFor="name" className="label">Nome</label>
            <input id="name" name="name" required className="input" autoComplete="name" />
          </div>
        )}
        <div>
          <label htmlFor="email" className="label">E-mail</label>
          <input id="email" name="email" type="email" required className="input" autoComplete="email" />
        </div>
        <div>
          <label htmlFor="password" className="label">Senha</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={isRegister ? 8 : undefined}
            className="input"
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </div>
        {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Aguarde..." : isRegister ? "Criar conta" : "Entrar"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-slate-600">
        {isRegister ? "Já tem conta? " : "Ainda não tem conta? "}
        <Link href={isRegister ? "/login" : "/register"} className="font-medium text-brand-600">
          {isRegister ? "Entrar" : "Criar conta"}
        </Link>
      </p>
    </div>
  );
}
