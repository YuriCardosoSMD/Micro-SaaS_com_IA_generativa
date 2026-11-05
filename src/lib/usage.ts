import { prisma } from "./db";
import type { CurrentUser } from "./auth";

export const FREE_MONTHLY_LIMIT = 3;

export interface UsageInfo {
  used: number;
  limit: number | null; // null = ilimitado
  remaining: number | null;
  canAnalyze: boolean;
}

function startOfCurrentMonth(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export async function getUsage(user: CurrentUser): Promise<UsageInfo> {
  const used = await prisma.analysis.count({
    where: { userId: user.id, createdAt: { gte: startOfCurrentMonth() } },
  });

  if (user.plan === "PRO") {
    return { used, limit: null, remaining: null, canAnalyze: true };
  }

  const remaining = Math.max(0, FREE_MONTHLY_LIMIT - used);
  return { used, limit: FREE_MONTHLY_LIMIT, remaining, canAnalyze: remaining > 0 };
}
