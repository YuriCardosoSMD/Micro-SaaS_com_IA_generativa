import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-600">
          Currículo<span className="text-slate-900">IA</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-4 text-sm">
            <Link href="/dashboard" className="text-slate-700 hover:text-brand-600">
              Painel
            </Link>
            <span className="hidden text-slate-500 sm:inline">{user.name}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                user.plan === "PRO" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-600"
              }`}
            >
              {user.plan}
            </span>
            <LogoutButton />
          </div>
        ) : (
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="text-slate-700 hover:text-brand-600">
              Entrar
            </Link>
            <Link href="/register" className="btn-primary">
              Criar conta
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}
