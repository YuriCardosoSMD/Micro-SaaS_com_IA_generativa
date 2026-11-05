import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Nome muito curto").max(80),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(8, "A senha precisa ter pelo menos 8 caracteres").max(100),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const analyzeSchema = z.object({
  jobTitle: z.string().trim().min(2, "Informe o título da vaga").max(120),
  resumeText: z
    .string()
    .trim()
    .min(200, "Cole o currículo completo (mínimo 200 caracteres)")
    .max(15000, "Currículo muito longo (máx. 15.000 caracteres)"),
  jobDescription: z
    .string()
    .trim()
    .min(50, "Cole a descrição da vaga (mínimo 50 caracteres)")
    .max(8000, "Descrição muito longa (máx. 8.000 caracteres)"),
});

export const coverLetterSchema = z.object({
  analysisId: z.string().min(1),
});

export const planSchema = z.object({
  plan: z.enum(["FREE", "PRO"]),
});

// Schema da resposta da IA — nunca confie cegamente no JSON retornado pelo modelo
export const aiAnalysisSchema = z.object({
  score: z.coerce.number().transform((n) => Math.max(0, Math.min(100, Math.round(n)))),
  summary: z.string(),
  strengths: z.array(z.string()).default([]),
  weaknesses: z.array(z.string()).default([]),
  missingKeywords: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
});

export type AnalysisResult = z.infer<typeof aiAnalysisSchema>;

export function firstZodError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Dados inválidos";
}
