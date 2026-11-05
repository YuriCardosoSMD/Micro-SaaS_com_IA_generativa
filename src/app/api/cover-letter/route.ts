import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateCoverLetter } from "@/lib/ai";
import { coverLetterSchema, firstZodError } from "@/lib/validators";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  if (user.plan !== "PRO") {
    return NextResponse.json(
      { error: "A carta de apresentação é exclusiva do plano PRO." },
      { status: 403 },
    );
  }

  const parsed = coverLetterSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }

  // Garante que a análise pertence ao usuário logado
  const analysis = await prisma.analysis.findFirst({
    where: { id: parsed.data.analysisId, userId: user.id },
  });
  if (!analysis) return NextResponse.json({ error: "Análise não encontrada" }, { status: 404 });

  try {
    const content = await generateCoverLetter({
      candidateName: user.name,
      jobTitle: analysis.jobTitle,
      resumeText: analysis.resumeText,
      jobDescription: analysis.jobDescription,
    });
    const letter = await prisma.coverLetter.create({
      data: { userId: user.id, analysisId: analysis.id, content },
    });
    return NextResponse.json({ content: letter.content }, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro inesperado";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
