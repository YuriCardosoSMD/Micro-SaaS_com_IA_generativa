"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Plan } from "@/lib/auth";

interface PlanCardProps {
  plan: Plan;
  used: number;
  limit: number | null;
}

export default function PlanCard({ plan, used, limit }: PlanCardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isPro = plan === "PRO";

  async function changePlan(next: Plan) {
    setLoading(true);
    await fetch("/api/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: next }),
    });
    setLoading(false);
    router.refresh();
  }

  const percent = limit ? Math.min(100, (used / limit) * 100) : 0;

  return (
    <div className="card">
      <p className="text-sm text-slate-500">Seu plano</p>
      <p className="text-2xl font-bold">{isPro ? "PRO ⭐" : "Grátis"}</p>
      {limit !== null ? (
        <>
          <p className="mt-3 text-sm text-slate-600">
            {used} de {limit} análises usadas este mês
          </p>
          <div className="mt-2 h-2 rounded-full bg-slate-100">
            <div className="h-2 rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
          </div>
        </>
      ) : (
        <p className="mt-3 text-sm text-slate-600">{used} análises este mês · ilimitado</p>
      )}
      <button
        type="button"
        disabled={loading}
        onClick={() => changePlan(isPro ? "FREE" : "PRO")}
        className={`mt-4 w-full ${isPro ? "btn-secondary" : "btn-primary"}`}
      >
        {loading ? "..." : isPro ? "Voltar para o Grátis" : "Fazer upgrade para PRO"}
      </button>
      <p className="mt-2 text-xs text-slate-400">Pagamento simulado (Stripe no roadmap)</p>
    </div>
  );
}
