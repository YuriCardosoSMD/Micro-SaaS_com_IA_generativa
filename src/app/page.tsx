import Link from "next/link";
import { FREE_MONTHLY_LIMIT } from "@/lib/usage";

const features = [
  { title: "Score de compatibilidade", text: "Nota de 0 a 100 comparando seu currículo com a vaga." },
  { title: "Palavras-chave ausentes", text: "Descubra os termos que os filtros ATS procuram e você não usa." },
  { title: "Sugestões práticas", text: "Recomendações específicas de reescrita para cada vaga." },
  { title: "Carta de apresentação", text: "Gerada com IA a partir do seu currículo real (PRO)." },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="pt-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Seu currículo passa no <span className="text-brand-600">filtro ATS</span>?
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Cole seu currículo e a descrição da vaga. Em segundos, a IA mostra sua compatibilidade,
          o que está faltando e como melhorar.
        </p>
        <Link href="/register" className="btn-primary mt-8 px-6 py-3 text-base">
          Começar grátis
        </Link>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        {features.map((f) => (
          <div key={f.title} className="card">
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-slate-600">{f.text}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h3 className="text-xl font-bold">Grátis</h3>
          <p className="mt-1 text-3xl font-extrabold">R$ 0</p>
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            <li>✓ {FREE_MONTHLY_LIMIT} análises por mês</li>
            <li>✓ Score e palavras-chave</li>
            <li className="text-slate-400">✗ Carta de apresentação</li>
          </ul>
        </div>
        <div className="card border-brand-500 ring-2 ring-brand-500">
          <h3 className="text-xl font-bold">PRO</h3>
          <p className="mt-1 text-3xl font-extrabold">
            R$ 19<span className="text-base font-normal text-slate-500">/mês</span>
          </p>
          <ul className="mt-4 space-y-1 text-sm text-slate-600">
            <li>✓ Análises ilimitadas</li>
            <li>✓ Score e palavras-chave</li>
            <li>✓ Carta de apresentação com IA</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
