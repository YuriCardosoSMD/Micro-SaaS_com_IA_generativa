"use client";

import { useState } from "react";

interface Props {
  analysisId: string;
  isPro: boolean;
  initialContent: string | null;
}

export default function CoverLetterSection({ analysisId, isPro, initialContent }: Props) {
  const [content, setContent] = useState<string | null>(initialContent);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ analysisId }),
      });
      const data = (await res.json()) as { content?: string; error?: string };
      if (!res.ok || !data.content) throw new Error(data.error ?? "Erro ao gerar carta");
      setContent(data.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro inesperado");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    if (!content) return;
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Carta de apresentação</h2>
        {!isPro && (
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
            Exclusivo PRO
          </span>
        )}
      </div>

      {content && (
        <pre className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-sans text-sm leading-relaxed text-slate-800">
          {content}
        </pre>
      )}

      {error && <p className="mt-3 text-sm text-red-600" role="alert">{error}</p>}

      <div className="mt-4 flex gap-2">
        <button type="button" onClick={generate} disabled={!isPro || loading} className="btn-primary">
          {loading ? "Gerando..." : content ? "Gerar novamente" : "Gerar carta com IA"}
        </button>
        {content && (
          <button type="button" onClick={copy} className="btn-secondary">
            {copied ? "Copiado!" : "Copiar"}
          </button>
        )}
      </div>
      {!isPro && (
        <p className="mt-2 text-sm text-slate-500">Faça upgrade no painel para desbloquear.</p>
      )}
    </section>
  );
}
