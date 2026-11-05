"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AnalyzeForm({ disabled }: { disabled: boolean }) {
  const router = useRouter();
  const [jobTitle, setJobTitle] = useState("");
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobTitle, resumeText, jobDescription }),
      });
      const data = (await res.json()) as { id?: string; error?: string };
      if (!res.ok || !data.id) throw new Error(data.error ?? "Erro ao analisar");
      router.push(`/dashboard/analysis/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card space-y-4">
      <h2 className="text-lg font-semibold">Nova análise</h2>
      <div>
        <label htmlFor="jobTitle" className="label">Título da vaga</label>
        <input
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="Ex.: Desenvolvedor Full Stack Júnior"
          className="input"
          required
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="resume" className="label">
            Seu currículo <span className="text-slate-400">({resumeText.length}/15000)</span>
          </label>
          <textarea
            id="resume"
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Cole aqui o texto do seu currículo..."
            className="input h-64 resize-y"
            maxLength={15000}
            required
          />
        </div>
        <div>
          <label htmlFor="job" className="label">
            Descrição da vaga <span className="text-slate-400">({jobDescription.length}/8000)</span>
          </label>
          <textarea
            id="job"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Cole aqui a descrição completa da vaga..."
            className="input h-64 resize-y"
            maxLength={8000}
            required
          />
        </div>
      </div>
      {error && <p className="text-sm text-red-600" role="alert">{error}</p>}
      <button type="submit" disabled={disabled || loading} className="btn-primary">
        {loading ? "Analisando com IA..." : "Analisar currículo"}
      </button>
    </form>
  );
}
