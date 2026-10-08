"use client";

import { createContext, use, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { LoginDialog } from "./LoginDialog";

export interface AppUser {
  id: string;
  name: string;
  email: string | null;
  avatarUrl: string | null;
}

interface AuthContextValue {
  user: AppUser | null;
  ready: boolean;
  /** true cuando no hay Supabase configurado: el inicio de sesión es simulado. */
  demo: boolean;
  /** Abre el diálogo de inicio de sesión. `then` se ejecuta al iniciar sesión sin salir de la página. */
  requestLogin: (then?: () => void) => void;
  signOut: () => Promise<void>;
  /** Solo modo demostración. */
  signInDemo: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const DEMO_KEY = "kp-demo-user";
const DEMO_USER: AppUser = { id: "demo-user", name: "Usuario de prueba", email: null, avatarUrl: null };

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const pending = useRef<(() => void) | null>(null);

  useEffect(() => {
    const supabase = getBrowserClient();
    if (!supabase) {
      // localStorage solo existe en el navegador, así que se lee tras montar.
      let saved = false;
      try {
        saved = Boolean(localStorage.getItem(DEMO_KEY));
      } catch {}
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(saved ? DEMO_USER : null);
      setReady(true);
      return;
    }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setUser(
        u
          ? {
              id: u.id,
              name: u.user_metadata?.full_name ?? u.user_metadata?.name ?? u.email?.split("@")[0] ?? "Tu cuenta",
              email: u.email ?? null,
              avatarUrl: u.user_metadata?.avatar_url ?? null,
            }
          : null,
      );
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const finishLogin = useCallback(() => {
    setLoginOpen(false);
    const then = pending.current;
    pending.current = null;
    then?.();
  }, []);

  const signInDemo = useCallback(() => {
    try {
      localStorage.setItem(DEMO_KEY, "1");
    } catch {}
    setUser(DEMO_USER);
    finishLogin();
  }, [finishLogin]);

  const requestLogin = useCallback((then?: () => void) => {
    pending.current = then ?? null;
    setLoginOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    const supabase = getBrowserClient();
    if (supabase) await supabase.auth.signOut();
    try {
      localStorage.removeItem(DEMO_KEY);
    } catch {}
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready, demo: !isSupabaseConfigured, requestLogin, signOut, signInDemo }),
    [user, ready, requestLogin, signOut, signInDemo],
  );

  return (
    <AuthContext value={value}>
      {children}
      {loginOpen ? (
        <LoginDialog
          demo={!isSupabaseConfigured}
          onDemoLogin={signInDemo}
          onClose={() => {
            pending.current = null;
            setLoginOpen(false);
          }}
        />
      ) : null}
    </AuthContext>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = use(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
