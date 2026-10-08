"use client";

import { useEffect, useRef, useState } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { Face } from "../ui/Logo";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; email: string } | { kind: "error"; message: string };

function callbackUrl(): string {
  const next = window.location.pathname + window.location.search;
  return `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
}

export function LoginDialog({
  demo,
  onDemoLogin,
  onClose,
}: {
  demo: boolean;
  onDemoLogin: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    ref.current?.showModal();
  }, []);

  const google = async () => {
    if (demo) return onDemoLogin();
    const { error } = await getBrowserClient()!.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl() },
    });
    if (error) setStatus({ kind: "error", message: "No pudimos conectar con Google. Intenta de nuevo." });
  };

  const magicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demo) return onDemoLogin();
    setStatus({ kind: "sending" });
    const { error } = await getBrowserClient()!.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: callbackUrl() },
    });
    setStatus(
      error
        ? { kind: "error", message: "No pudimos enviar el enlace. Revisa el correo e intenta de nuevo." }
        : { kind: "sent", email },
    );
  };

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && ref.current?.close()}
      aria-labelledby="login-title"
      className="m-auto w-[min(400px,calc(100%-32px))] rounded-3xl bg-surface p-0 text-ink shadow-soft backdrop:bg-black/50"
    >
      <div className="px-6 pt-6 pb-5 text-center">
        <Face className="mx-auto w-28" />
        {status.kind === "sent" ? (
          <>
            <h2 id="login-title" className="mt-1 font-display text-3xl leading-tight text-brand-ink">
              Revisa tu correo
            </h2>
            <p className="mt-1 mb-4 text-sm text-ink-2">
              Te enviamos un enlace a <b className="text-ink">{status.email}</b>. Ábrelo desde este dispositivo para entrar.
            </p>
          </>
        ) : (
          <>
            <h2 id="login-title" className="mt-1 font-display text-3xl leading-tight text-brand-ink">
              Inicia sesión para puntuar
            </h2>
            <p className="mt-1 mb-4 text-sm text-ink-2">
              Así cada familia vota una sola vez por sitio y las estrellas son confiables.
            </p>
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={google}
                className="inline-flex items-center justify-center gap-2 rounded-full border-[1.5px] border-line-strong px-4 py-2.5 font-extrabold hover:bg-chip"
              >
                <span
                  className="inline-block size-[18px] rounded-full"
                  style={{ background: "conic-gradient(#ea4335 0 25%,#fbbc05 0 50%,#34a853 0 75%,#4285f4 0)" }}
                />
                Continuar con Google
              </button>
              <div className="my-1 flex items-center gap-2.5 text-xs text-ink-2 before:h-px before:flex-1 before:bg-line after:h-px after:flex-1 after:bg-line">
                o recibe un enlace en tu correo
              </div>
              <form onSubmit={magicLink} className="flex flex-col gap-2.5">
                <label htmlFor="login-email" className="sr-only">
                  Correo electrónico
                </label>
                <input
                  id="login-email"
                  type="email"
                  required={!demo}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  className="rounded-xl border-[1.5px] border-line bg-bg px-3 py-2.5 outline-none focus:border-teal"
                />
                <button
                  type="submit"
                  disabled={status.kind === "sending"}
                  className="rounded-full bg-orange px-4 py-2.5 font-extrabold text-on-orange disabled:opacity-60"
                >
                  {status.kind === "sending" ? "Enviando…" : "Enviarme el enlace"}
                </button>
              </form>
              {status.kind === "error" ? <p className="text-sm font-bold text-[#b4433b]">{status.message}</p> : null}
            </div>
            {demo ? (
              <p className="mt-3 text-xs text-ink-2">Modo demostración: el inicio de sesión es simulado hasta conectar Supabase.</p>
            ) : null}
          </>
        )}
        <button type="button" onClick={() => ref.current?.close()} className="mt-3 font-bold text-ink-2">
          {status.kind === "sent" ? "Cerrar" : "Ahora no"}
        </button>
      </div>
    </dialog>
  );
}
