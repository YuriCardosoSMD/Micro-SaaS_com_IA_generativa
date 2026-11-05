import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getUsage } from "@/lib/usage";
import { analyzeResume } from "@/lib/ai";
import { analyzeSchema, firstZodError } from "@/lib/validators";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = analyzeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }

  const usage = await getUsage(user);
  if (!usage.canAnalyze) {
    return NextResponse.json(
      { error: "Você atingiu o limite de análises grátis deste mês. Faça upgrade para o plano PRO." },
      { status: 403 },
    );
  }

  const { jobTitle, resumeText, jobDescription } = parsed.data;

  try {
    const result = await analyzeResume(resumeText, jobTitle, jobDescription);
    const analysis = await prisma.analysis.create({
      data: {
        userId: user.id,
        jobTitle,
        resumeText,
        jobDescription,
        score: result.score,
        summary: result.summary,
        strengths: JSON.stringify(result.strengths),
        weaknesses: JSON.stringify(result.weaknesses),
        missingKeywords: JSON.stringify(result.missingKeywords),
        suggestions: JSON.stringify(result.suggestions),
      },
    });
    return NextResponse.json({ id: analysis.id }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
