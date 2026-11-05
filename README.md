# CurrículoIA — Analisador de Currículo com IA (ATS Checker)

Micro-SaaS full stack que compara um currículo com a descrição de uma vaga e retorna:
**score de compatibilidade**, **palavras-chave ausentes**, **pontos fortes/fracos**, **sugestões de melhoria** e uma **carta de apresentação gerada por IA** (plano PRO).

## 🧱 Stack
- **Next.js 14 (App Router) + TypeScript** — front e back no mesmo projeto
- **Tailwind CSS** — estilização
- **Prisma ORM** — SQLite em desenvolvimento, PostgreSQL em produção
- **Autenticação própria com JWT** (`jose`) em cookie httpOnly + senhas com `bcryptjs`
- **Zod** — validação de entradas *e* da resposta da IA
- **OpenAI API** (ou qualquer API compatível) — com **modo demo** quando não há chave

## 🚀 Como rodar localmente
```bash
npm install
cp .env.example .env      # edite JWT_SECRET (e OPENAI_API_KEY, se tiver)
npx prisma db push        # cria o banco SQLite
npm run dev               # http://localhost:3000
```
> Sem `OPENAI_API_KEY`, o app funciona em **modo demo** (análise heurística por palavras-chave), então dá para testar tudo sem gastar nada.

## 🗂️ Estrutura
```
prisma/schema.prisma          # User, Analysis, CoverLetter
src/
  middleware.ts               # protege /dashboard (verifica JWT no Edge)
  lib/
    ai.ts                     # prompts, chamada à IA, modo demo
    auth.ts / session.ts      # sessão JWT em cookie httpOnly
    usage.ts                  # regra de negócio: 3 análises/mês no plano grátis
    validators.ts             # schemas Zod
  app/
    api/auth/{register,login,logout}
    api/analyze               # cria análise (respeita limite do plano)
    api/cover-letter          # gera carta (somente PRO)
    api/plan                  # troca de plano (simulada)
    dashboard/                # painel + histórico
    dashboard/analysis/[id]/  # resultado detalhado
```

## 🧠 Decisões técnicas (bom para falar em entrevista)
- **Resposta da IA validada com Zod**: o modelo pode devolver JSON inválido; o app nunca confia cegamente.
- **Limite de uso calculado no servidor** (contagem de análises no mês), não no front.
- **Autorização por recurso**: toda consulta filtra por `userId`, então um usuário não acessa análises de outro.
- **Middleware no Edge** só valida o JWT; acesso ao banco fica nas rotas Node.
- **Modo demo**: facilita avaliação do projeto por recrutadores sem custo de API.

## 🛣️ Roadmap
- [ ] Upload de currículo em PDF (extração de texto)
- [ ] Pagamento real com Stripe Checkout + webhook
- [ ] Rate limiting nas rotas de IA
- [ ] Testes (Vitest + Playwright)
- [ ] Deploy na Vercel + PostgreSQL (Neon/Supabase)

## ☁️ Deploy com PostgreSQL
1. Em `prisma/schema.prisma`, troque `provider = "sqlite"` por `"postgresql"`.
2. Configure `DATABASE_URL`, `JWT_SECRET` e `OPENAI_API_KEY` na Vercel.
3. Rode `npx prisma db push` apontando para o banco de produção.
