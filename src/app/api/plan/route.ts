import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { firstZodError, planSchema } from "@/lib/validators";

/**
 * SIMULAÇÃO de troca de plano.
 * Próxima etapa (roadmap): substituir por Stripe Checkout + webhook
 * que atualiza o plano somente após o pagamento confirmado.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Não autenticado" }, { status: 401 });

  const parsed = planSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { plan: parsed.data.plan } });
  return NextResponse.json({ plan: parsed.data.plan });
}
