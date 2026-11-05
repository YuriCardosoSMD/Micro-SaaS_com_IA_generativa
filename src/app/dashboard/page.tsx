import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUsage } from "@/lib/usage";
import { isDemoMode } from "@/lib/ai";
import AnalyzeForm from "@/components/AnalyzeForm";
import PlanCard from "@/components/PlanCard";
import ScoreBadge from "@/components/ScoreBadge";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [usage, analyses] = await Promise.all([
    getUsage(user),
    prisma.analysis.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: { id: true, jobTitle: true, score: true, createdAt: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Olá, {user.name.split(" ")[0]} 👋</h1>
        <p className="text-slate-600">Analise seu currículo para uma vaga específica.</p>
      </div>

      {isDemoMode() && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Modo demo:</strong> nenhuma OPENAI_API_KEY configurada. A análise usa uma heurística
          simples de palavras-chave.
        </div>
      )}

      {!usage.canAnalyze && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Você usou todas as análises grátis deste mês. Faça upgrade para continuar.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <AnalyzeForm disabled={!usage.canAnalyze} />

        <div className="space-y-6">
          <PlanCard plan={user.plan} used={usage.used} limit={usage.limit} />

          <div className="card">
            <h2 className="mb-3 font-semibold">Histórico</h2>
            {analyses.length === 0 ? (
              <p className="text-sm text-slate-500">Nenhuma análise ainda.</p>
            ) : (
              <ul className="space-y-2">
                {analyses.map((a) => (
                  <li key={a.id}>
                    <Link
                      href={`/dashboard/analysis/${a.id}`}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
                    >
                      <ScoreBadge score={a.score} />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{a.jobTitle}</p>
                        <p className="text-xs text-slate-500">
                          {a.createdAt.toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
