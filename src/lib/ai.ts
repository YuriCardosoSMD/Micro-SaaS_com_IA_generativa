import { aiAnalysisSchema, type AnalysisResult } from "./validators";

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

export const isDemoMode = (): boolean => !process.env.OPENAI_API_KEY;

async function chatCompletion(messages: ChatMessage[], jsonMode: boolean): Promise<string> {
  const baseUrl = process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1";
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      messages,
      temperature: jsonMode ? 0.2 : 0.7,
      ...(jsonMode ? { response_format: { type: "json_object" } } : {}),
    }),
  });

  if (!res.ok) {
    const detail = await res.text();
    console.error("Erro na API de IA:", res.status, detail);
    throw new Error("Falha ao consultar o serviço de IA. Tente novamente.");
  }

  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("Resposta vazia do serviço de IA.");
  return content;
}

// ---------------------------------------------------------------------------
// Análise de currículo (ATS)
// ---------------------------------------------------------------------------

const ANALYSIS_SYSTEM_PROMPT = `Você é um recrutador técnico sênior e especialista em sistemas ATS (Applicant Tracking System).
Analise o currículo em relação à vaga e responda APENAS com um JSON válido no formato:
{
  "score": number (0-100, compatibilidade do currículo com a vaga),
  "summary": string (2-3 frases com o diagnóstico geral),
  "strengths": string[] (3-5 pontos fortes do currículo PARA ESTA VAGA),
  "weaknesses": string[] (3-5 pontos fracos ou lacunas),
  "missingKeywords": string[] (até 10 palavras-chave/tecnologias importantes da vaga ausentes no currículo),
  "suggestions": string[] (3-6 sugestões práticas e específicas de reescrita)
}
Responda em português do Brasil. Seja específico e honesto; não invente experiências.`;

export async function analyzeResume(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
): Promise<AnalysisResult> {
  if (isDemoMode()) return heuristicAnalysis(resumeText, jobDescription);

  const raw = await chatCompletion(
    [
      { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
      {
        role: "user",
        content: `VAGA: ${jobTitle}\n\nDESCRIÇÃO DA VAGA:\n${jobDescription}\n\nCURRÍCULO:\n${resumeText}`,
      },
    ],
    true,
  );

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error("A IA retornou um formato inválido. Tente novamente.");
  }

  const parsed = aiAnalysisSchema.safeParse(json);
  if (!parsed.success) throw new Error("A IA retornou dados incompletos. Tente novamente.");
  return parsed.data;
}

// ---------------------------------------------------------------------------
// Carta de apresentação
// ---------------------------------------------------------------------------

export async function generateCoverLetter(params: {
  candidateName: string;
  jobTitle: string;
  resumeText: string;
  jobDescription: string;
}): Promise<string> {
  const { candidateName, jobTitle, resumeText, jobDescription } = params;

  if (isDemoMode()) {
    return `Prezados(as),

Meu nome é ${candidateName} e gostaria de me candidatar à vaga de ${jobTitle}.

[MODO DEMO] Configure a variável OPENAI_API_KEY para gerar uma carta de apresentação personalizada com IA, baseada no seu currículo e na descrição da vaga.

Atenciosamente,
${candidateName}`;
  }

  return chatCompletion(
    [
      {
        role: "system",
        content:
          "Você escreve cartas de apresentação profissionais em português do Brasil. Use no máximo 300 palavras, tom confiante e natural, conecte experiências REAIS do currículo aos requisitos da vaga. Não invente fatos. Retorne apenas o texto da carta.",
      },
      {
        role: "user",
        content: `Candidato: ${candidateName}\nVaga: ${jobTitle}\n\nDESCRIÇÃO DA VAGA:\n${jobDescription}\n\nCURRÍCULO:\n${resumeText}`,
      },
    ],
    false,
  );
}

// ---------------------------------------------------------------------------
// Modo demo: análise heurística por palavras-chave (funciona sem chave de API)
// ---------------------------------------------------------------------------

const STOPWORDS = new Set(
  "para como com sem uma umas uns que dos das nos nas pelo pela pelos pelas sobre entre será sera ser são sao está esta você voce nossa nosso nossos nossas seus suas sua seu mais muito também tambem experiência experiencia conhecimento conhecimentos vaga empresa time equipe trabalho trabalhar desejável desejavel requisitos atividades responsabilidades anos the and with for you our will have".split(
    " ",
  ),
);

function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-zà-ú0-9#+.]{3,}/gi) ?? []).map((w) => w.replace(/\.$/, ""));
}

function heuristicAnalysis(resumeText: string, jobDescription: string): AnalysisResult {
  const resumeWords = new Set(tokenize(resumeText));
  const freq = new Map<string, number>();
  for (const word of tokenize(jobDescription)) {
    if (STOPWORDS.has(word) || word.length < 3) continue;
    freq.set(word, (freq.get(word) ?? 0) + 1);
  }

  const keywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);

  const found = keywords.filter((k) => resumeWords.has(k));
  const missing = keywords.filter((k) => !resumeWords.has(k));
  const score = keywords.length ? Math.round((found.length / keywords.length) * 100) : 0;

  return {
    score,
    summary: `[MODO DEMO] Seu currículo contém ${found.length} de ${keywords.length} termos relevantes da vaga. Configure OPENAI_API_KEY para uma análise completa com IA.`,
    strengths: found.slice(0, 5).map((k) => `Menciona "${k}", termo presente na vaga`),
    weaknesses: missing.slice(0, 3).map((k) => `Não menciona "${k}"`),
    missingKeywords: missing.slice(0, 10),
    suggestions: [
      "Inclua as palavras-chave ausentes onde houver experiência real com elas.",
      "Use verbos de ação e resultados mensuráveis (ex.: 'reduzi o tempo de resposta em 30%').",
      "Evite tabelas e colunas: muitos ATS não leem esse tipo de formatação.",
    ],
  };
}
