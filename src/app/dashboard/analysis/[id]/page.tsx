import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { parseStringArray } from "@/lib/json";
import ScoreBadge from "@/components/ScoreBadge";
import CoverLetterSection from "@/components/CoverLetterSection";

export const dynamic = "force-dynamic";

function ListSection({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  if (items.length === 0) return null;
  return (
    <section className="card">
      <h2 className="mb-3 text-lg font-semibold">{title}</h2>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className={`rounded-lg border-l-4 bg-slate-50 px-3 py-2 text-sm ${tone}`}>
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function AnalysisPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const analysis = await prisma.analysis.findFirst({
    where: { id: params.id, userId: user.id },
    include: { coverLetters: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!analysis) notFound();

  const missingKeywords = parseStringArray(analysis.missingKeywords);

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-brand-600 hover:underline">
        ← Voltar ao painel
      </Link>

      <section className="card flex flex-col items-center gap-6 sm:flex-row">
        <ScoreBadge score={analysis.score} size="lg" />
        <div>
          <p className="text-sm text-slate-500">Compatibilidade com a vaga</p>
          <h1 className="text-2xl font-bold">{analysis.jobTitle}</h1>
          <p className="mt-2 text-slate-700">{analysis.summary}</p>
        </div>
      </section>

      {missingKeywords.length > 0 && (
        <section className="card">
          <h2 className="mb-3 text-lg font-semibold">Palavras-chave ausentes</h2>
          <div className="flex flex-wrap gap-2">
            {missingKeywords.map((k) => (
              <span key={k} className="rounded-full bg-red-50 px-3 py-1 text-sm text-red-700">
                {k}
              </span>
            ))}
          </div>
        </section>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <ListSection title="Pontos fortes" items={parseStringArray(analysis.strengths)} tone="border-green-500" />
        <ListSection title="Pontos fracos" items={parseStringArray(analysis.weaknesses)} tone="border-red-400" />
      </div>

      <ListSection title="Sugestões de melhoria" items={parseStringArray(analysis.suggestions)} tone="border-brand-500" />

      <CoverLetterSection
        analysisId={analysis.id}
        isPro={user.plan === "PRO"}
        initialContent={analysis.coverLetters[0]?.content ?? null}
      />
    </div>
  );
}
