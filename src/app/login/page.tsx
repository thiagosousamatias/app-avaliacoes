"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [entrando, setEntrando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setEntrando(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    setEntrando(false);
    if (error) {
      setErro(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4">
      <h1 className="mb-1 text-xl font-bold text-slate-800">Painel de gestão</h1>
      <p className="mb-6 text-sm text-slate-500">Entre com seu e-mail e senha.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          required
          placeholder="seu.email@empresa.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-base focus:border-slate-500 focus:outline-none"
        />
        <input
          type="password"
          required
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="min-h-12 w-full rounded-xl border-2 border-slate-300 px-4 text-base focus:border-slate-500 focus:outline-none"
        />
        {erro && <p className="text-sm text-red-600">{erro}</p>}
        <button
          type="submit"
          disabled={entrando}
          className="min-h-12 w-full rounded-xl bg-slate-800 font-semibold text-white disabled:bg-slate-300"
        >
          {entrando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
