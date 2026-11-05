import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { firstZodError, loginSchema } from "@/lib/validators";

export async function POST(req: Request) {
  const parsed = loginSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstZodError(parsed.error) }, { status: 400 });
  }
  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !valid) {
    // Mensagem genérica: não revela se o e-mail existe
    return NextResponse.json({ error: "E-mail ou senha incorretos" }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ ok: true });
}
